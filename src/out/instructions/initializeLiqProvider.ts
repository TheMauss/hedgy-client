import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitializeLiqProviderAccounts {
  liqProvider: PublicKey
  providersWallet: PublicKey
  houseAcc: PublicKey
  systemProgram: PublicKey
}

export function initializeLiqProvider(
  accounts: InitializeLiqProviderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.liqProvider, isSigner: false, isWritable: true },
    { pubkey: accounts.providersWallet, isSigner: true, isWritable: true },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([211, 32, 50, 207, 98, 39, 237, 240])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
