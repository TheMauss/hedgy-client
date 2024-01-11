import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface WithdrawFromPdaHouseWalletArgs {
  amount: BN
}

export interface WithdrawFromPdaHouseWalletAccounts {
  houseWalletAccount: PublicKey
  pdaHouseWalletAccount: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([borsh.u64("amount")])

export function withdrawFromPdaHouseWallet(
  args: WithdrawFromPdaHouseWalletArgs,
  accounts: WithdrawFromPdaHouseWalletAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.houseWalletAccount, isSigner: true, isWritable: true },
    {
      pubkey: accounts.pdaHouseWalletAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([134, 183, 54, 86, 15, 49, 162, 64])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      amount: args.amount,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
