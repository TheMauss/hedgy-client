import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ResolveFuturesContractuserAccounts {
  futuresContract: PublicKey
  playerWalletAccount: PublicKey
  oracleAccount: PublicKey
  pdaHouseWalletAccount: PublicKey
  clock: PublicKey
  systemProgram: PublicKey
}

export function resolveFuturesContractuser(
  accounts: ResolveFuturesContractuserAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.futuresContract, isSigner: false, isWritable: true },
    { pubkey: accounts.playerWalletAccount, isSigner: true, isWritable: true },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
    {
      pubkey: accounts.pdaHouseWalletAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([221, 218, 55, 86, 240, 226, 128, 152])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
