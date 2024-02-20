import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreateLimitOrderArgs {
  number: BN
  betAmount: BN
  leverage: BN
  priceDirection: number
  symbol: number
  slPrice: BN
  tpPrice: BN
  initialPrice: BN
  backOracle: number
  usdc: number
}

export interface CreateLimitOrderAccounts {
  futCont: PublicKey
  playerAcc: PublicKey
  userAcc: PublicKey
  ratioAcc: PublicKey
  houseAcc: PublicKey
  lpAcc: PublicKey
  signerServer: PublicKey
  oracleAccount: PublicKey
  pdaHouseAcc: PublicKey
  clock: PublicKey
  systemProgram: PublicKey
  usdcMint: PublicKey
  usdcPlayerAcc: PublicKey
  usdcPdaHouseAcc: PublicKey
  tokenProgram: PublicKey
  associatedTokenProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.u64("number"),
  borsh.u64("betAmount"),
  borsh.u64("leverage"),
  borsh.u8("priceDirection"),
  borsh.u8("symbol"),
  borsh.i64("slPrice"),
  borsh.i64("tpPrice"),
  borsh.i64("initialPrice"),
  borsh.u8("backOracle"),
  borsh.u8("usdc"),
])

export function createLimitOrder(
  args: CreateLimitOrderArgs,
  accounts: CreateLimitOrderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.futCont, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.ratioAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.signerServer, isSigner: true, isWritable: false },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.usdcMint, isSigner: false, isWritable: true },
    { pubkey: accounts.usdcPlayerAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.usdcPdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
  ]
  const identifier = Buffer.from([76, 161, 70, 122, 82, 20, 142, 75])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      number: args.number,
      betAmount: args.betAmount,
      leverage: args.leverage,
      priceDirection: args.priceDirection,
      symbol: args.symbol,
      slPrice: args.slPrice,
      tpPrice: args.tpPrice,
      initialPrice: args.initialPrice,
      backOracle: args.backOracle,
      usdc: args.usdc,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
