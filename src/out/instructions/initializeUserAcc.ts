import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitializeUserAccArgs {
  usedAffiliate: Array<number>
}

export interface InitializeUserAccAccounts {
  userAcc: PublicKey
  playerAcc: PublicKey
  affilAcc: PublicKey
  systemProgram: PublicKey
  clock: PublicKey
  usdcMint: PublicKey
  usdcPlayerAcc: PublicKey
  associatedTokenProgram: PublicKey
  tokenProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.array(borsh.u8(), 8, "usedAffiliate"),
])

export function initializeUserAcc(
  args: InitializeUserAccArgs,
  accounts: InitializeUserAccAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.affilAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.usdcMint, isSigner: false, isWritable: false },
    { pubkey: accounts.usdcPlayerAcc, isSigner: false, isWritable: true },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([204, 194, 220, 101, 21, 55, 210, 240])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      usedAffiliate: args.usedAffiliate,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
