import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface DepositToLiquidityPoolArgs {
  depositAmount: BN
}

export interface DepositToLiquidityPoolAccounts {
  liqProvider: PublicKey
  providersWallet: PublicKey
  lpAcc: PublicKey
  signerWalletAccount: PublicKey
  houseAcc: PublicKey
  pdaHouseAcc: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([borsh.u64("depositAmount")])

export function depositToLiquidityPool(
  args: DepositToLiquidityPoolArgs,
  accounts: DepositToLiquidityPoolAccounts,
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
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: false },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([96, 214, 0, 30, 142, 170, 238, 130])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      depositAmount: args.depositAmount,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
