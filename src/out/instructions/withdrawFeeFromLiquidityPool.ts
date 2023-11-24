import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface WithdrawFeeFromLiquidityPoolAccounts {
  liqProvider: PublicKey
  providersWallet: PublicKey
  lpAcc: PublicKey
  signerWalletAccount: PublicKey
  houseAcc: PublicKey
  pdaHouseAcc: PublicKey
  lpRevAcc: PublicKey
  systemProgram: PublicKey
}

export function withdrawFeeFromLiquidityPool(
  accounts: WithdrawFeeFromLiquidityPoolAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.liqProvider, isSigner: false, isWritable: true },
    { pubkey: accounts.providersWallet, isSigner: true, isWritable: true },
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.signerWalletAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.lpRevAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([154, 36, 176, 26, 190, 77, 131, 233])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
