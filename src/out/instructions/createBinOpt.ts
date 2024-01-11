import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreateBinOptArgs {
  number: BN
  affiliateCode: Array<number>
  betAmount: BN
  expiration: BN
  priceDirection: number
  symbol: number
  slippagePrice: BN
  slippage: BN
}

export interface CreateBinOptAccounts {
  binOpt: PublicKey
  playerAcc: PublicKey
  userAcc: PublicKey
  ratioAcc: PublicKey
  nftAcc: PublicKey
  houseAcc: PublicKey
  oracleAccount: PublicKey
  pdaHouseAcc: PublicKey
  affilAcc: PublicKey
  lpAcc: PublicKey
  signerWalletAccount: PublicKey
  lpRevAcc: PublicKey
  clock: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.u64("number"),
  borsh.array(borsh.u8(), 8, "affiliateCode"),
  borsh.u64("betAmount"),
  borsh.u64("expiration"),
  borsh.u8("priceDirection"),
  borsh.u8("symbol"),
  borsh.i64("slippagePrice"),
  borsh.i64("slippage"),
])

export function createBinOpt(
  args: CreateBinOptArgs,
  accounts: CreateBinOptAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.binOpt, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.ratioAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.nftAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.affilAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    {
      pubkey: accounts.signerWalletAccount,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.lpRevAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([187, 223, 82, 220, 39, 72, 145, 225])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      number: args.number,
      affiliateCode: args.affiliateCode,
      betAmount: args.betAmount,
      expiration: args.expiration,
      priceDirection: args.priceDirection,
      symbol: args.symbol,
      slippagePrice: args.slippagePrice,
      slippage: args.slippage,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
