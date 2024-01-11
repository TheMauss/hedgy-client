import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitializeUserAccountAccounts {
  userAccount: PublicKey
  playerWalletAccount: PublicKey
  systemProgram: PublicKey
  clock: PublicKey
}

export function initializeUserAccount(
  accounts: InitializeUserAccountAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.userAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.playerWalletAccount, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([131, 248, 61, 211, 152, 205, 122, 238])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
