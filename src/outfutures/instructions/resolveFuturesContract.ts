import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ResolveFuturesContractAccounts {
  futuresContract: PublicKey
  playerWalletAccount: PublicKey
  signerServer: PublicKey
  oracleAccount: PublicKey
  pdaHouseWalletAccount: PublicKey
  clock: PublicKey
  systemProgram: PublicKey
}

export function resolveFuturesContract(
  accounts: ResolveFuturesContractAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.futuresContract, isSigner: false, isWritable: true },
    { pubkey: accounts.playerWalletAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.signerServer, isSigner: true, isWritable: false },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
    {
      pubkey: accounts.pdaHouseWalletAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([22, 170, 141, 56, 217, 176, 85, 140])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
