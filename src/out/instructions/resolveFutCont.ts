import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ResolveFutContAccounts {
  futCont: PublicKey
  userAcc: PublicKey
  ratioAcc: PublicKey
  playerAcc: PublicKey
  signerServer: PublicKey
  oracleAccount: PublicKey
  pdaHouseAcc: PublicKey
  lpAcc: PublicKey
  lpRevAcc: PublicKey
  clock: PublicKey
  systemProgram: PublicKey
  houseAcc: PublicKey
}

export function resolveFutCont(
  accounts: ResolveFutContAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.futCont, isSigner: false, isWritable: true },
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.ratioAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.signerServer, isSigner: true, isWritable: false },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.lpRevAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: true },
  ]
  const identifier = Buffer.from([186, 213, 121, 51, 18, 95, 36, 207])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
