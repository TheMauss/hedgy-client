import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ResolveFutContuserAccounts {
  futCont: PublicKey
  userAcc: PublicKey
  ratioAcc: PublicKey
  playerAcc: PublicKey
  oracleAccount: PublicKey
  pdaHouseAcc: PublicKey
  lpAcc: PublicKey
  signerWalletAccount: PublicKey
  lpRevAcc: PublicKey
  clock: PublicKey
  systemProgram: PublicKey
  houseAcc: PublicKey
}

export function resolveFutContuser(
  accounts: ResolveFutContuserAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.futCont, isSigner: false, isWritable: true },
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.ratioAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    {
      pubkey: accounts.signerWalletAccount,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.lpRevAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: true },
  ]
  const identifier = Buffer.from([29, 221, 85, 210, 247, 20, 168, 228])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
