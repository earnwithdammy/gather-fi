import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gatherfi } from "../target/types/gatherfi";
import { assert } from "chai";

describe("gatherfi", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Gatherfi as Program<Gatherfi>;

  it("initializes the program", async () => {
    const organizer = provider.wallet;

    const name = "Lagos Tech Meetup";
    const city = "Lagos";
    const category = "Tech";
    const fundingGoal = new anchor.BN(1_000_000_000);
    const deadline = new anchor.BN(
      Math.floor(Date.now() / 1000) + 86400
    );

    const [eventPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("event"),
        organizer.publicKey.toBuffer(),
        Buffer.from(name),
      ],
      program.programId
    );

    await program.methods
      .initialize(
        name,
        city,
        category,
        fundingGoal,
        deadline
      )
      .accounts({
        event: eventPda,
        organizer: organizer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const eventAccount = await program.account.event.fetch(eventPda);

    assert.equal(eventAccount.name, name);
    assert.equal(eventAccount.city, city);
    assert.equal(eventAccount.category, category);
    assert.equal(
      eventAccount.organizer.toBase58(),
      organizer.publicKey.toBase58()
    );
  });
});
