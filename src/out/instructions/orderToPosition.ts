import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface OrderToPositionAccounts {
  futCont: PublicKey
  playerAcc: PublicKey
  userAcc: PublicKey
  ratioAcc: PublicKey
  houseAcc: PublicKey
  signerServer: PublicKey
  oracleAccount: PublicKey
  solOracleAccount: PublicKey
  lpAcc: PublicKey
  clock: PublicKey
  systemProgram: PublicKey
}

export function orderToPosition(
  accounts: OrderToPositionAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.futCont, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.ratioAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.signerServer, isSigner: true, isWritable: false },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.solOracleAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([169, 193, 30, 98, 155, 149, 119, 239])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
