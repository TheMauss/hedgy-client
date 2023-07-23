import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreateBinaryOptionArgs {
  number: BN
  betAmount: BN
  expiration: BN
  priceDirection: number
  symbol: number
}

export interface CreateBinaryOptionAccounts {
  playerWalletAccount: PublicKey
  houseWalletAccount: PublicKey
  binaryOption: PublicKey
  oracleAccount: PublicKey
  pdaHouseWalletAccount: PublicKey
  clock: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.u64("number"),
  borsh.u64("betAmount"),
  borsh.u64("expiration"),
  borsh.u8("priceDirection"),
  borsh.u8("symbol"),
])

export function createBinaryOption(
  args: CreateBinaryOptionArgs,
  accounts: CreateBinaryOptionAccounts
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.playerWalletAccount, isSigner: true, isWritable: true },
    { pubkey: accounts.houseWalletAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.binaryOption, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
    {
      pubkey: accounts.pdaHouseWalletAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([45, 165, 63, 211, 195, 126, 95, 226])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      number: args.number,
      betAmount: args.betAmount,
      expiration: args.expiration,
      priceDirection: args.priceDirection,
      symbol: args.symbol,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
