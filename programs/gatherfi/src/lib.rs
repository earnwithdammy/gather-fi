use anchor_lang::prelude::*;

declare_id!("E31mecmt7WbRrRgSWDChV31D7tENN2WDKLnTuagWjJyu");

#[program]
pub mod gatherfi {
    use super::*;

    /// Initialize the program (runs once)
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.admin = ctx.accounts.admin.key();
        Ok(())
    }

    /// Create a new group
    pub fn create_group(
        ctx: Context<CreateGroup>,
        name: String,
    ) -> Result<()> {
        let group = &mut ctx.accounts.group;
        group.admin = ctx.accounts.admin.key();
        group.name = name;
        group.balance = 0;
        Ok(())
    }

    /// Deposit lamports into the group
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.group.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.group.to_account_info(),
            ],
        )?;

        ctx.accounts.group.balance += amount;
        Ok(())
    }

    /// Withdraw lamports (admin only)
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let group = &mut ctx.accounts.group;

        require!(
            ctx.accounts.admin.key() == group.admin,
            CustomError::Unauthorized
        );

        **group.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.admin.to_account_info().try_borrow_mut_lamports()? += amount;

        group.balance -= amount;
        Ok(())
    }
}

/* ===================== ACCOUNTS ===================== */

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = 8 + 32)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateGroup<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 64 + 8)]
    pub group: Account<'info, Group>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub group: Account<'info, Group>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

/* ===================== STATE ===================== */

#[account]
pub struct State {
    pub admin: Pubkey,
}

#[account]
pub struct Group {
    pub admin: Pubkey,
    pub name: String,
    pub balance: u64,
}

/* ===================== ERRORS ===================== */

#[error_code]
pub enum CustomError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
}
