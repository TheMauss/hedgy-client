import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ResolveBinaryOptionArgs {
  finalPrice: BN
}

export interface ResolveBinaryOptionAccounts {
  binaryOption: PublicKey
  playerWalletAccount: PublicKey
  userAccount: PublicKey
  ratioAccount: PublicKey
  signerServer: PublicKey
  houseWalletAccount: PublicKey
  pdaHouseWalletAccount: PublicKey
  clock: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([borsh.i64("finalPrice")])

export function resolveBinaryOption(
  args: ResolveBinaryOptionArgs,
  accounts: ResolveBinaryOptionAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.binaryOption, isSigner: false, isWritable: true },
    { pubkey: accounts.playerWalletAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.userAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.ratioAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.signerServer, isSigner: true, isWritable: false },
    { pubkey: accounts.houseWalletAccount, isSigner: false, isWritable: false },
    {
      pubkey: accounts.pdaHouseWalletAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([161, 237, 105, 81, 58, 9, 121, 199])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      finalPrice: args.finalPrice,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
