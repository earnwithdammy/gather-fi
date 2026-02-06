use anchor_lang::prelude::*;

declare_id!("E31mecmt7WbRrRgSWDChV31D7tENN2WDKLnTuagWjJyu");

#[program]
pub mod gatherfi {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
