"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { getProgram } from "../../lib/anchor";

export default function Dashboard() {
  const wallet = useWallet();

  async function withdraw() {
    const program = getProgram(wallet);
    await program.methods.withdrawOrganizer().rpc();
    alert("Withdrawn");
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Organizer Dashboard</h1>
      <button onClick={withdraw}>Withdraw Organizer Profit</button>
    </main>
  );
}
