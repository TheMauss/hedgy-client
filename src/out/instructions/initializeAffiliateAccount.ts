import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitializeAffiliateAccountArgs {
  affiliateCode: Array<number>
}

export interface InitializeAffiliateAccountAccounts {
  affiliateAccount: PublicKey
  userAccount: PublicKey
  playerWalletAccount: PublicKey
  systemProgram: PublicKey
  clock: PublicKey
}

export const layout = borsh.struct([
  borsh.array(borsh.u8(), 8, "affiliateCode"),
])

export function initializeAffiliateAccount(
  args: InitializeAffiliateAccountArgs,
  accounts: InitializeAffiliateAccountAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.affiliateAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.userAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.playerWalletAccount, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([194, 229, 54, 238, 96, 28, 229, 70])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      affiliateCode: args.affiliateCode,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
