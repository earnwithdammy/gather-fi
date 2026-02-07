use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Mint, Token, TokenAccount, MintTo, Transfer,
};

declare_id!("E31mecmt7WbRrRgSWDChV31D7tENN2WDKLnTuagWjJyu");

#[program]
pub mod gatherfi {
    use super::*;

    /* ================= CREATE EVENT ================= */

    pub fn create_event(
        ctx: Context<CreateEvent>,
        name: String,
        ticket_price: u64,
        max_tickets: u32,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;

        event.organizer = ctx.accounts.organizer.key();
        event.name = name;
        event.ticket_price = ticket_price;
        event.max_tickets = max_tickets;
        event.tickets_sold = 0;
        event.total_revenue = 0;
        event.organizer_withdrawn = 0;
        event.platform_withdrawn = 0;
        event.active = true;

        Ok(())
    }

    /* ================= BUY TICKET ================= */

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        let event = &mut ctx.accounts.event;

        require!(event.active, ErrorCode::EventInactive);
        require!(event.tickets_sold < event.max_tickets, ErrorCode::SoldOut);

        // Pay into vault
        token::transfer(
            ctx.accounts.pay_ctx(),
            event.ticket_price,
        )?;

        // Mint NFT ticket
        let seeds = &[
            b"mint-authority",
            event.key().as_ref(),
            &[ctx.bumps.mint_authority],
        ];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.ticket_mint.to_account_info(),
                    to: ctx.accounts.buyer_ticket_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                &[seeds],
            ),
            1,
        )?;

        event.tickets_sold += 1;
        event.total_revenue += event.ticket_price;

        Ok(())
    }

    /* ================= BACKER CLAIM ================= */

    pub fn claim_backer_profit(ctx: Context<ClaimBackerProfit>) -> Result<()> {
        let event = &ctx.accounts.event;

        let pool = event.total_revenue * 60 / 100;
        let payout = pool / event.tickets_sold as u64;

        let seeds = &[
            b"vault-authority",
            event.key().as_ref(),
            &[ctx.bumps.vault_authority],
        ];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.user_usdc.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
                &[seeds],
            ),
            payout,
        )?;

        Ok(())
    }

    /* ================= ORGANIZER WITHDRAW ================= */

    pub fn withdraw_organizer(ctx: Context<WithdrawOrganizer>) -> Result<()> {
        let event = &mut ctx.accounts.event;

        let max = event.total_revenue * 35 / 100;
        let available = max.saturating_sub(event.organizer_withdrawn);
        require!(available > 0, ErrorCode::NothingToWithdraw);

        let seeds = &[
            b"vault-authority",
            event.key().as_ref(),
            &[ctx.bumps.vault_authority],
        ];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.organizer_usdc.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
                &[seeds],
            ),
            available,
        )?;

        event.organizer_withdrawn += available;
        Ok(())
    }
}

/* ================= ACCOUNTS ================= */

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    #[account(init, payer = organizer, space = 8 + Event::SIZE)]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub organizer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        constraint = buyer_usdc.owner == buyer.key()
    )]
    pub buyer_usdc: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub ticket_mint: Account<'info, Mint>,

    #[account(mut)]
    pub buyer_ticket_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"mint-authority", event.key().as_ref()],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

impl<'info> BuyTicket<'info> {
    fn pay_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.buyer_usdc.to_account_info(),
                to: self.vault.to_account_info(),
                authority: self.buyer.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct ClaimBackerProfit<'info> {
    pub event: Account<'info, Event>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_usdc: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"vault-authority", event.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawOrganizer<'info> {
    #[account(mut, has_one = organizer)]
    pub event: Account<'info, Event>,

    pub organizer: Signer<'info>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub organizer_usdc: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"vault-authority", event.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

/* ================= STATE ================= */

#[account]
pub struct Event {
    pub organizer: Pubkey,
    pub name: String,
    pub ticket_price: u64,
    pub max_tickets: u32,
    pub tickets_sold: u32,
    pub total_revenue: u64,
    pub organizer_withdrawn: u64,
    pub platform_withdrawn: u64,
    pub active: bool,
}

impl Event {
    pub const SIZE: usize = 32 + 4 + 64 + 8 + 4 + 4 + 8 + 8 + 8 + 1;
}

/* ================= ERRORS ================= */

#[error_code]
pub enum ErrorCode {
    #[msg("Event inactive")]
    EventInactive,
    #[msg("Sold out")]
    SoldOut,
    #[msg("Nothing to withdraw")]
    NothingToWithdraw,
}
