use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Token, TokenAccount, Mint, Transfer,
};

declare_id!("GaTheRFi1111111111111111111111111111111111");

#[program]
pub mod gatherfi {
    use super::*;

    // --------------------------------------------------
    // CREATE EVENT
    // --------------------------------------------------
    pub fn create_event(
        ctx: Context<CreateEvent>,
        ticket_price: u64,
        max_tickets: u32,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;

        event.organizer = ctx.accounts.organizer.key();
        event.ticket_price = ticket_price;
        event.max_tickets = max_tickets;
        event.tickets_sold = 0;
        event.total_revenue = 0;
        event.organizer_withdrawn = 0;
        event.bump = ctx.bumps.event;

        Ok(())
    }

    // --------------------------------------------------
    // BUY TICKET
    // --------------------------------------------------
    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        let price = ctx.accounts.event.ticket_price;

        require!(
            ctx.accounts.event.tickets_sold < ctx.accounts.event.max_tickets,
            GatherFiError::SoldOut
        );

        // ---- CPI FIRST ----
        token::transfer(ctx.accounts.transfer_ctx(), price)?;

        // ---- STATE UPDATE AFTER ----
        let event = &mut ctx.accounts.event;
        event.tickets_sold += 1;
        event.total_revenue += price;

        Ok(())
    }

    // --------------------------------------------------
    // ORGANIZER WITHDRAW
    // --------------------------------------------------
    pub fn withdraw_organizer(
        ctx: Context<WithdrawOrganizer>,
        amount: u64,
    ) -> Result<()> {
        let available = ctx.accounts.event.total_revenue
            - ctx.accounts.event.organizer_withdrawn;

        require!(amount <= available, GatherFiError::InsufficientFunds);

        // ---- PDA SEEDS ----
        let event_key = ctx.accounts.event.key();
        let seeds = &[
            b"vault",
            event_key.as_ref(),
            &[ctx.bumps.vault],
        ];
        let signer = &[&seeds[..]];

        // ---- CPI FIRST ----
        token::transfer(
            ctx.accounts.withdraw_ctx().with_signer(signer),
            amount,
        )?;

        // ---- UPDATE STATE ----
        let event = &mut ctx.accounts.event;
        event.organizer_withdrawn += amount;

        Ok(())
    }
}

//
// =====================================================
// ACCOUNTS
// =====================================================
//

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = organizer,
        space = 8 + Event::SIZE,
        seeds = [b"event", organizer.key().as_ref()],
        bump
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
    pub buyer_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", event.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl<'info> BuyTicket<'info> {
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let accounts = Transfer {
            from: self.buyer_token.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.buyer.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), accounts)
    }
}

#[derive(Accounts)]
pub struct WithdrawOrganizer<'info> {
    #[account(mut, has_one = organizer)]
    pub event: Account<'info, Event>,

    #[account(mut)]
    pub organizer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", event.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub organizer_token: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl<'info> WithdrawOrganizer<'info> {
    pub fn withdraw_ctx(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.organizer_token.to_account_info(),
            authority: self.vault.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), accounts)
    }
}

//
// =====================================================
// STATE
// =====================================================
//

#[account]
pub struct Event {
    pub organizer: Pubkey,
    pub ticket_price: u64,
    pub max_tickets: u32,
    pub tickets_sold: u32,
    pub total_revenue: u64,
    pub organizer_withdrawn: u64,
    pub bump: u8,
}

impl Event {
    pub const SIZE: usize =
        32 + // organizer
        8 +  // ticket_price
        4 +  // max_tickets
        4 +  // tickets_sold
        8 +  // total_revenue
        8 +  // organizer_withdrawn
        1;   // bump
}

//
// =====================================================
// ERRORS
// =====================================================
//

#[error_code]
pub enum GatherFiError {
    #[msg("Event is sold out")]
    SoldOut,

    #[msg("Insufficient withdrawable balance")]
    InsufficientFunds,
}
