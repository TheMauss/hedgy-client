import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitializeLongShortRatioAccounts {
  ratioAcc: PublicKey
  houseAcc: PublicKey
  systemProgram: PublicKey
}

export function initializeLongShortRatio(
  accounts: InitializeLongShortRatioAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.ratioAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.houseAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([186, 199, 41, 10, 134, 252, 165, 19])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
