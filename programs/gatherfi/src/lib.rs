use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer};

declare_id!("E31mecmt7WbRrRgSWDChV31D7tENN2WDKLnTuagWjJyu");

#[program]
pub mod gatherfi {
    use super::*;

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
        event.active = true;
        event.total_revenue = 0;
        event.organizer_withdrawn = 0;
        event.platform_withdrawn = 0;
        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        let event = &mut ctx.accounts.event;

        require!(event.active, ErrorCode::EventInactive);
        require!(event.tickets_sold < event.max_tickets, ErrorCode::SoldOut);

        token::transfer(ctx.accounts.pay_ctx(), event.ticket_price)?;

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

        ctx.accounts.ticket_account.owner = ctx.accounts.buyer.key();
        ctx.accounts.ticket_account.event = event.key();
        ctx.accounts.ticket_account.claimed = false;

        event.tickets_sold += 1;
        event.total_revenue += event.ticket_price;

        Ok(())
    }

    pub fn claim_backer_profit(ctx: Context<ClaimBackerProfit>) -> Result<()> {
        let event = &ctx.accounts.event;
        let ticket = &mut ctx.accounts.ticket_account;

        require!(!ticket.claimed, ErrorCode::AlreadyClaimed);
        require!(event.tickets_sold > 0, ErrorCode::NoRevenue);

        let backer_pool = event.total_revenue * 60 / 100;
        let payout = backer_pool / event.tickets_sold as u64;

        token::transfer(ctx.accounts.transfer_ctx(), payout)?;

        ticket.claimed = true;
        Ok(())
    }

    pub fn withdraw_organizer(ctx: Context<WithdrawOrganizer>) -> Result<()> {
        let event = &mut ctx.accounts.event;

        let max = event.total_revenue * 35 / 100;
        let available = max
            .checked_sub(event.organizer_withdrawn)
            .ok_or(ErrorCode::NothingToWithdraw)?;

        require!(available > 0, ErrorCode::NothingToWithdraw);

        token::transfer(ctx.accounts.transfer_ctx(), available)?;
        event.organizer_withdrawn += available;
        Ok(())
    }

    pub fn withdraw_platform(ctx: Context<WithdrawPlatform>) -> Result<()> {
        let event = &mut ctx.accounts.event;

        let max = event.total_revenue * 5 / 100;
        let available = max
            .checked_sub(event.platform_withdrawn)
            .ok_or(ErrorCode::NothingToWithdraw)?;

        require!(available > 0, ErrorCode::NothingToWithdraw);

        token::transfer(ctx.accounts.transfer_ctx(), available)?;
        event.platform_withdrawn += available;
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
    #[account(mut)]
    pub buyer_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub escrow_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub ticket_mint: Account<'info, Mint>,
    #[account(mut)]
    pub buyer_ticket_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = buyer,
        seeds = [b"ticket", ticket_mint.key().as_ref(), buyer.key().as_ref()],
        bump,
        space = 8 + TicketAccount::SIZE
    )]
    pub ticket_account: Account<'info, TicketAccount>,
    #[account(
        seeds = [b"mint-authority", event.key().as_ref()],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> BuyTicket<'info> {
    fn pay_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.buyer_usdc.to_account_info(),
                to: self.escrow_usdc.to_account_info(),
                authority: self.buyer.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct ClaimBackerProfit<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    #[account(mut, has_one = owner, has_one = event)]
    pub ticket_account: Account<'info, TicketAccount>,
    pub owner: Signer<'info>,
    #[account(mut)]
    pub escrow_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub owner_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

impl<'info> ClaimBackerProfit<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.escrow_usdc.to_account_info(),
                to: self.owner_usdc.to_account_info(),
                authority: self.event.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct WithdrawOrganizer<'info> {
    #[account(mut, has_one = organizer)]
    pub event: Account<'info, Event>,
    pub organizer: Signer<'info>,
    #[account(mut)]
    pub escrow_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub organizer_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

impl<'info> WithdrawOrganizer<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.escrow_usdc.to_account_info(),
                to: self.organizer_usdc.to_account_info(),
                authority: self.event.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct WithdrawPlatform<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    pub platform_authority: Signer<'info>,
    #[account(mut)]
    pub escrow_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub platform_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

impl<'info> WithdrawPlatform<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.escrow_usdc.to_account_info(),
                to: self.platform_usdc.to_account_info(),
                authority: self.event.to_account_info(),
            },
        )
    }
}

/* ================= STATE ================= */

#[account]
pub struct Event {
    pub organizer: Pubkey,
    pub name: String,
    pub ticket_price: u64,
    pub max_tickets: u32,
    pub tickets_sold: u32,
    pub active: bool,
    pub total_revenue: u64,
    pub organizer_withdrawn: u64,
    pub platform_withdrawn: u64,
}

impl Event {
    pub const SIZE: usize = 32 + 4 + 64 + 8 + 4 + 4 + 1 + 8 + 8 + 8;
}

#[account]
pub struct TicketAccount {
    pub owner: Pubkey,
    pub event: Pubkey,
    pub claimed: bool,
}

impl TicketAccount {
    pub const SIZE: usize = 32 + 32 + 1;
}

/* ================= ERRORS ================= */

#[error_code]
pub enum ErrorCode {
    #[msg("Event inactive")]
    EventInactive,
    #[msg("Sold out")]
    SoldOut,
    #[msg("Already claimed")]
    AlreadyClaimed,
    #[msg("No revenue")]
    NoRevenue,
    #[msg("Nothing to withdraw")]
    NothingToWithdraw,
}
