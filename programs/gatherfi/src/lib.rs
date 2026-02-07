use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer};

declare_id!("6M995chq6GY891Zyjvg9ZVASutZ9rMDAeXqDzxszHcCJ");

#[program]
pub mod gatherfi {
    use super::*;

    /* ================= CREATE EVENT ================= */
    pub fn create_event(
        ctx: Context<CreateEvent>,
        name: String,
        ticket_price: u64,      // in USDC (6 decimals)
        max_tickets: u32,
        exchange_rate: u64,     // USDC to NGN rate × 100 (e.g., 1500 = ₦1500)
        city: NigerianCity,
        category: EventCategory,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        let clock = Clock::get()?;
        
        // Calculate Naira equivalent
        let naira_price = ticket_price
            .checked_mul(exchange_rate)
            .ok_or(ErrorCode::MathOverflow)? / 1_000_000;
        
        event.organizer = ctx.accounts.organizer.key();
        event.name = name;
        event.ticket_price_usdc = ticket_price;
        event.naira_equivalent = naira_price;
        event.exchange_rate = exchange_rate;
        event.max_tickets = max_tickets;
        event.tickets_sold = 0;
        event.total_revenue = 0;
        event.organizer_withdrawn = 0;
        event.platform_withdrawn = 0;
        event.active = true;
        event.city = city;
        event.category = category;
        event.created_at = clock.unix_timestamp;
        event.event_date = 0; // Set later
        
        emit!(EventCreated {
            organizer: event.organizer,
            event: event.key(),
            ticket_price_usdc: ticket_price,
            naira_price: naira_price,
            city: city,
            category: category,
        });

        Ok(())
    }

    /* ================= BUY TICKET ================= */
    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        // Extract data before mutable borrow
        let is_active = ctx.accounts.event.active;
        let tickets_sold = ctx.accounts.event.tickets_sold;
        let max_tickets = ctx.accounts.event.max_tickets;
        let ticket_price = ctx.accounts.event.ticket_price_usdc;
        
        require!(is_active, ErrorCode::EventInactive);
        require!(tickets_sold < max_tickets, ErrorCode::SoldOut);
        
        // Pay into vault
        token::transfer(
            ctx.accounts.pay_ctx(),
            ticket_price,
        )?;

        // Now mutate event
        let event = &mut ctx.accounts.event;
        let event_key = event.key();
        let seeds = &[
            b"mint-authority",
            event_key.as_ref(),
            &[ctx.bumps.mint_authority],
        ];

        // Mint NFT ticket
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
        event.total_revenue += ticket_price;
        
        emit!(TicketPurchased {
            buyer: ctx.accounts.buyer.key(),
            event: event.key(),
            ticket_price: ticket_price,
            ticket_number: event.tickets_sold,
        });

        Ok(())
    }

    /* ================= BACKER CLAIM PROFIT ================= */
    pub fn claim_backer_profit(ctx: Context<ClaimBackerProfit>) -> Result<()> {
        let event = &ctx.accounts.event;
        require!(event.tickets_sold > 0, ErrorCode::NoTicketsSold);
        
        let pool = event.total_revenue * 60 / 100;
        let payout = pool / event.tickets_sold as u64;
        
        let event_key = event.key();
        let seeds = &[
            b"vault-authority",
            event_key.as_ref(),
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
        
        let event_key = event.key();
        let seeds = &[
            b"vault-authority",
            event_key.as_ref(),
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
        
        emit!(OrganizerWithdrew {
            organizer: event.organizer,
            event: event.key(),
            amount: available,
        });

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
        constraint = buyer_usdc.owner == buyer.key(),
        token::mint = usdc_mint,
    )]
    pub buyer_usdc: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub ticket_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        constraint = buyer_ticket_account.owner == buyer.key(),
        token::mint = ticket_mint,
    )]
    pub buyer_ticket_account: Account<'info, TokenAccount>,
    
    /// CHECK: PDA authority verified by seeds
    #[account(
        seeds = [b"mint-authority", event.key().as_ref()],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    
    pub usdc_mint: Account<'info, Mint>,
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
    
    /// CHECK: PDA authority verified by seeds
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
    
    /// CHECK: PDA authority verified by seeds
    #[account(
        seeds = [b"vault-authority", event.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
}

/* ================= STATE & ENUMS ================= */

#[account]
pub struct Event {
    pub organizer: Pubkey,
    pub name: String,
    pub ticket_price_usdc: u64,
    pub naira_equivalent: u64,
    pub exchange_rate: u64,
    pub max_tickets: u32,
    pub tickets_sold: u32,
    pub total_revenue: u64,
    pub organizer_withdrawn: u64,
    pub platform_withdrawn: u64,
    pub active: bool,
    pub city: NigerianCity,
    pub category: EventCategory,
    pub created_at: i64,
    pub event_date: i64,
}

impl Event {
    pub const SIZE: usize = 32 + 64 + 8 + 8 + 8 + 4 + 4 + 8 + 8 + 8 + 1 + 1 + 1 + 8 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum NigerianCity {
    Lagos,
    Abuja,
    PortHarcourt,
    Ibadan,
    Kano,
    BeninCity,
    Enugu,
    Aba,
    Kaduna,
    Ogbomosho,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum EventCategory {
    Owambe,
    NaijaWedding,
    ChurchProgram,
    CampusEvent,
    TechMeetup,
    AfrobeatConcert,
    BusinessSummit,
    FashionShow,
}

/* ================= EVENTS ================= */

#[event]
pub struct EventCreated {
    pub organizer: Pubkey,
    pub event: Pubkey,
    pub ticket_price_usdc: u64,
    pub naira_price: u64,
    pub city: NigerianCity,
    pub category: EventCategory,
}

#[event]
pub struct TicketPurchased {
    pub buyer: Pubkey,
    pub event: Pubkey,
    pub ticket_price: u64,
    pub ticket_number: u32,
}

#[event]
pub struct OrganizerWithdrew {
    pub organizer: Pubkey,
    pub event: Pubkey,
    pub amount: u64,
}

/* ================= ERRORS ================= */

#[error_code]
pub enum ErrorCode {
    #[msg("Event is inactive")]
    EventInactive,
    #[msg("Event is sold out")]
    SoldOut,
    #[msg("Nothing to withdraw")]
    NothingToWithdraw,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("No tickets sold yet")]
    NoTicketsSold,
}