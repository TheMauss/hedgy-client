import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface LockLpAccAccounts {
  lpAcc: PublicKey
  houseAcc: PublicKey
  signerWalletAccount: PublicKey
  systemProgram: PublicKey
}

export function lockLpAcc(
  accounts: LockLpAccAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.houseAcc, isSigner: true, isWritable: true },
    {
      pubkey: accounts.signerWalletAccount,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([110, 212, 165, 202, 17, 164, 136, 35])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
