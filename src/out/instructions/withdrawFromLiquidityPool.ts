import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface WithdrawFromLiquidityPoolArgs {
  withdrawAmount: BN
}

export interface WithdrawFromLiquidityPoolAccounts {
  liqProvider: PublicKey
  providersWallet: PublicKey
  lpAcc: PublicKey
  signerWalletAccount: PublicKey
  ratioAcc: PublicKey
  houseAcc: PublicKey
  pdaHouseAcc: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([borsh.u64("withdrawAmount")])

export function withdrawFromLiquidityPool(
  args: WithdrawFromLiquidityPoolArgs,
  accounts: WithdrawFromLiquidityPoolAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.liqProvider, isSigner: false, isWritable: true },
    { pubkey: accounts.providersWallet, isSigner: true, isWritable: true },
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    {
      pubkey: accounts.signerWalletAccount,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.ratioAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: false },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([225, 90, 221, 102, 240, 250, 152, 150])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      withdrawAmount: args.withdrawAmount,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}