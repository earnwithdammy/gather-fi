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
        event.bump = ctx.bumps.event;
        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        let price = ctx.accounts.event.ticket_price;

        require!(ctx.accounts.event.active, ErrorCode::EventInactive);
        require!(
            ctx.accounts.event.tickets_sold < ctx.accounts.event.max_tickets,
            ErrorCode::SoldOut
        );

        // Pay USDC
        token::transfer(ctx.accounts.pay_ctx(), price)?;

        // Mint NFT ticket
        let seeds = &[
            b"event",
            ctx.accounts.event.organizer.as_ref(),
            &[ctx.accounts.event.bump],
        ];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.ticket_mint.to_account_info(),
                    to: ctx.accounts.buyer_ticket_account.to_account_info(),
                    authority: ctx.accounts.event.to_account_info(),
                },
                &[seeds],
            ),
            1,
        )?;

        // Write ticket account
        let ticket = &mut ctx.accounts.ticket_account;
        ticket.owner = ctx.accounts.buyer.key();
        ticket.event = ctx.accounts.event.key();
        ticket.claimed = false;

        // Update event AFTER CPI
        let event = &mut ctx.accounts.event;
        event.tickets_sold += 1;
        event.total_revenue += price;

        Ok(())
    }

    pub fn claim_backer_profit(ctx: Context<ClaimBackerProfit>) -> Result<()> {
        let event = &ctx.accounts.event;
        let ticket = &mut ctx.accounts.ticket_account;

        require!(!ticket.claimed, ErrorCode::AlreadyClaimed);
        require!(event.tickets_sold > 0, ErrorCode::NoRevenue);

        let pool = event.total_revenue * 60 / 100;
        let payout = pool / event.tickets_sold as u64;

        let seeds = &[
            b"event",
            event.organizer.as_ref(),
            &[event.bump],
        ];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_usdc.to_account_info(),
                    to: ctx.accounts.owner_usdc.to_account_info(),
                    authority: ctx.accounts.event.to_account_info(),
                },
                &[seeds],
            ),
            payout,
        )?;

        ticket.claimed = true;
        Ok(())
    }

    pub fn withdraw_organizer(ctx: Context<WithdrawOrganizer>) -> Result<()> {
        let max = ctx.accounts.event.total_revenue * 35 / 100;
        let available = max
            .checked_sub(ctx.accounts.event.organizer_withdrawn)
            .ok_or(ErrorCode::NothingToWithdraw)?;

        require!(available > 0, ErrorCode::NothingToWithdraw);

        let seeds = &[
            b"event",
            ctx.accounts.event.organizer.as_ref(),
            &[ctx.accounts.event.bump],
        ];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_usdc.to_account_info(),
                    to: ctx.accounts.organizer_usdc.to_account_info(),
                    authority: ctx.accounts.event.to_account_info(),
                },
                &[seeds],
            ),
            available,
        )?;

        ctx.accounts.event.organizer_withdrawn += available;
        Ok(())
    }

    pub fn withdraw_platform(ctx: Context<WithdrawPlatform>) -> Result<()> {
        let max = ctx.accounts.event.total_revenue * 5 / 100;
        let available = max
            .checked_sub(ctx.accounts.event.platform_withdrawn)
            .ok_or(ErrorCode::NothingToWithdraw)?;

        require!(available > 0, ErrorCode::NothingToWithdraw);

        let seeds = &[
            b"event",
            ctx.accounts.event.organizer.as_ref(),
            &[ctx.accounts.event.bump],
        ];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_usdc.to_account_info(),
                    to: ctx.accounts.platform_usdc.to_account_info(),
                    authority: ctx.accounts.event.to_account_info(),
                },
                &[seeds],
            ),
            available,
        )?;

        ctx.accounts.event.platform_withdrawn += available;
        Ok(())
    }
}

/* ================= ACCOUNTS ================= */

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = organizer,
        seeds = [b"event", organizer.key().as_ref()],
        bump,
        space = 8 + Event::SIZE
    )]
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
        seeds = [b"ticket", event.key().as_ref(), buyer.key().as_ref()],
        bump,
        space = 8 + TicketAccount::SIZE
    )]
    pub ticket_account: Account<'info, TicketAccount>,
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
    #[account(mut)]
    pub ticket_account: Account<'info, TicketAccount>,
    pub owner: Signer<'info>,
    #[account(mut)]
    pub escrow_usdc: Account<'info, TokenAccount>,
    #[account(mut)]
    pub owner_usdc: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
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
    pub bump: u8,
}

impl Event {
    pub const SIZE: usize =
        32 +                 // organizer
        4 + 64 +             // name
        8 +                  // ticket_price
        4 +                  // max_tickets
        4 +                  // tickets_sold
        1 +                  // active
        8 +                  // total_revenue
        8 +                  // organizer_withdrawn
        8 +                  // platform_withdrawn
        1;                   // bump
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
