import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreateFuturesContractArgs {
  number: BN
  affiliateCode: Array<number>
  betAmount: BN
  leverage: BN
  priceDirection: number
  symbol: number
  stopLossPrice: BN
  takeProfitPrice: BN
}

export interface CreateFuturesContractAccounts {
  playerWalletAccount: PublicKey
  userAccount: PublicKey
  ratioAccount: PublicKey
  houseWalletAccount: PublicKey
  futuresContract: PublicKey
  oracleAccount: PublicKey
  pdaHouseWalletAccount: PublicKey
  affiliateAccount: PublicKey
  clock: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.u64("number"),
  borsh.array(borsh.u8(), 8, "affiliateCode"),
  borsh.u64("betAmount"),
  borsh.u64("leverage"),
  borsh.u8("priceDirection"),
  borsh.u8("symbol"),
  borsh.i64("stopLossPrice"),
  borsh.i64("takeProfitPrice"),
])

export function createFuturesContract(
  args: CreateFuturesContractArgs,
  accounts: CreateFuturesContractAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.playerWalletAccount, isSigner: true, isWritable: true },
    { pubkey: accounts.userAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.ratioAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.houseWalletAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.futuresContract, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
    {
      pubkey: accounts.pdaHouseWalletAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.affiliateAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([24, 204, 88, 183, 27, 111, 74, 16])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      number: args.number,
      affiliateCode: args.affiliateCode,
      betAmount: args.betAmount,
      leverage: args.leverage,
      priceDirection: args.priceDirection,
      symbol: args.symbol,
      stopLossPrice: args.stopLossPrice,
      takeProfitPrice: args.takeProfitPrice,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
