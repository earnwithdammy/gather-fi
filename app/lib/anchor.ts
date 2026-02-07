import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { IDL } from './idl/gatherfi'

// Program ID - Update this after deployment
export const PROGRAM_ID = new PublicKey('E31mecmt7WbRrRgSWDChV31D7tENN2WDKLnTuagWjJyu')

export type GatherFiProgram = Program<typeof IDL>

export function useGatherFiProgram() {
  const { connection } = useConnection()
  const wallet = useAnchorWallet()
  const [program, setProgram] = useState<GatherFiProgram | null>(null)

  useEffect(() => {
    if (!wallet || !connection) {
      setProgram(null)
      return
    }

    try {
      const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      })

      const program = new Program(IDL, PROGRAM_ID, provider)
      setProgram(program)
    } catch (error) {
      console.error('Error creating Anchor program:', error)
      setProgram(null)
    }
  }, [wallet, connection])

  return program
}

// Helper function to get event PDA
export function getEventPDA(organizer: PublicKey, eventName: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('event'),
      organizer.toBuffer(),
      Buffer.from(eventName.slice(0, 32)), // Limit name length
    ],
    PROGRAM_ID
  )
  return pda
}

// Helper function to get vault authority PDA
export function getVaultAuthorityPDA(eventKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault-authority'), eventKey.toBuffer()],
    PROGRAM_ID
  )
}

// Helper function to get mint authority PDA
export function getMintAuthorityPDA(eventKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('mint-authority'), eventKey.toBuffer()],
    PROGRAM_ID
  )
}

// USDC mint address on devnet
export const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU') // Devnet USDC

// Connection helper
export function getConnection() {
  return new Connection(clusterApiUrl('devnet'), 'confirmed')
}