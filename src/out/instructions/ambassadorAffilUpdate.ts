import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface AmbassadorAffilUpdateArgs {
  usedAffiliate: Array<number>
}

export interface AmbassadorAffilUpdateAccounts {
  userAcc: PublicKey
  affilAcc: PublicKey
  playerAcc: PublicKey
  houseAcc: PublicKey
  systemProgram: PublicKey
  clock: PublicKey
}

export const layout = borsh.struct([
  borsh.array(borsh.u8(), 8, "usedAffiliate"),
])

export function ambassadorAffilUpdate(
  args: AmbassadorAffilUpdateArgs,
  accounts: AmbassadorAffilUpdateAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.affilAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.houseAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([205, 148, 69, 139, 220, 25, 50, 141])
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
