import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface WithdrawAffiliateEarningsAccounts {
  affilAcc: PublicKey
  playerAcc: PublicKey
  pdaHouseAcc: PublicKey
  systemProgram: PublicKey
}

export function withdrawAffiliateEarnings(
  accounts: WithdrawAffiliateEarningsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.affilAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([117, 50, 89, 157, 24, 37, 86, 130])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
