import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gatherfi } from "../target/types/gatherfi";

describe("gatherfi", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Gatherfi as Program<Gatherfi>;

  it("Create event", async () => {
    const event = anchor.web3.Keypair.generate();

    await program.methods
      .createEvent("Lagos Event", new anchor.BN(1_000_000), 10)
      .accounts({
        event: event.publicKey,
        organizer: program.provider.wallet.publicKey,
      })
      .signers([event])
      .rpc();

    const stored = await program.account.event.fetch(event.publicKey);
    console.log(stored.name);
  });
});
