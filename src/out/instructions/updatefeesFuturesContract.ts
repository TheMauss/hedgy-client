import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdatefeesFuturesContractAccounts {
  futuresContract: PublicKey
  signerServer: PublicKey
  oracleAccount: PublicKey
  houseWalletAccount: PublicKey
  ratioAccount: PublicKey
  clock: PublicKey
}

export function updatefeesFuturesContract(
  accounts: UpdatefeesFuturesContractAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.futuresContract, isSigner: false, isWritable: true },
    { pubkey: accounts.signerServer, isSigner: true, isWritable: false },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.houseWalletAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.ratioAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([160, 93, 134, 170, 154, 251, 220, 160])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
