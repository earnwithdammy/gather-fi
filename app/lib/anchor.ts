import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import idl from "../../target/idl/gatherfi.json";

export function getProgram(wallet: any) {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const provider = new AnchorProvider(connection, wallet, {});
  return new Program(idl as any, provider);
}
