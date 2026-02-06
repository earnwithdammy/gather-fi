use anchor_lang::prelude::*;

/* =====================================
   PROGRAM ID
===================================== */
declare_id!("E31mecmt7WbRrRgXXXXXXXXXXXXXXXXXXXX");

/* =====================================
   PROGRAM ENTRYPOINT
===================================== */
#[program]
pub mod gatherfi {
    use super::*;

    /* ---------------------------------
       CREATE EVENT
    ---------------------------------- */
    pub fn create_event(
        ctx: Context<CreateEvent>,
        name: String,
        city: String,
        category: String,
        target_amount: u64,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;

        event.organizer = ctx.accounts.organizer.key();
        event.name = name;
        event.city = city;
        event.category = category;
        event.target_amount = target_amount;
        event.total_raised = 0;
        event.status = EventStatus::Fundraising;
        event.created_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    /* ---------------------------------
       CONTRIBUTE TO EVENT
    ---------------------------------- */
    pub fn contribute(
        ctx: Context<Contribute>,
        amount: u64,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;

        require!(
            event.status == EventStatus::Fundraising,
            GatherFiError::InvalidEventStatus
        );

        **ctx.accounts.contributor.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.escrow.try_borrow_mut_lamports()? += amount;

        event.total_raised += amount;

        Ok(())
    }

    /* ---------------------------------
       CANCEL EVENT
    ---------------------------------- */
    pub fn cancel_event(ctx: Context<CancelEvent>) -> Result<()> {
        let event = &mut ctx.accounts.event;

        require!(
            event.organizer == ctx.accounts.organizer.key(),
            GatherFiError::Unauthorized
        );

        event.status = EventStatus::Cancelled;

        Ok(())
    }
}

/* =====================================
   ACCOUNTS
===================================== */

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = organizer,
        space = Event::SPACE,
        seeds = [b"event", organizer.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,

    #[account(mut)]
    pub organizer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,

    /// CHECK: Escrow PDA
    #[account(
        mut,
        seeds = [b"escrow", event.key().as_ref()],
        bump
    )]
    pub escrow: UncheckedAccount<'info>,

    #[account(mut)]
    pub contributor: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelEvent<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,

    pub organizer: Signer<'info>,
}

/* =====================================
   STATE
===================================== */

#[account]
pub struct Event {
    pub organizer: Pubkey,
    pub name: String,
    pub city: String,
    pub category: String,
    pub target_amount: u64,
    pub total_raised: u64,
    pub status: EventStatus,
    pub created_at: i64,
}

/* =====================================
   ENUMS
===================================== */

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EventStatus {
    Fundraising,
    Live,
    Completed,
    Cancelled,
}

/* =====================================
   SPACE CALCULATION
===================================== */

impl Event {
    pub const SPACE: usize =
        8 +     // discriminator
        32 +    // organizer
        4 + 64 + // name
        4 + 32 + // city
        4 + 32 + // category
        8 +     // target_amount
        8 +     // total_raised
        1 +     // status
        8;      // created_at
}

/* =====================================
   ERRORS
===================================== */

#[error_code]
pub enum GatherFiError {
    #[msg("Unauthorized action")]
    Unauthorized,

    #[msg("Invalid event status")]
    InvalidEventStatus,
}
