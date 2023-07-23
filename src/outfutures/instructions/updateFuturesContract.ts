import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateFuturesContractArgs {
  takeProfitPrice: BN
  stopLossPrice: BN
}

export interface UpdateFuturesContractAccounts {
  futuresContract: PublicKey
  playerWalletAccount: PublicKey
}

export const layout = borsh.struct([
  borsh.i64("takeProfitPrice"),
  borsh.i64("stopLossPrice"),
])

export function updateFuturesContract(
  args: UpdateFuturesContractArgs,
  accounts: UpdateFuturesContractAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.futuresContract, isSigner: false, isWritable: true },
    { pubkey: accounts.playerWalletAccount, isSigner: true, isWritable: true },
  ]
  const identifier = Buffer.from([47, 212, 224, 10, 92, 113, 142, 222])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      takeProfitPrice: args.takeProfitPrice,
      stopLossPrice: args.stopLossPrice,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
