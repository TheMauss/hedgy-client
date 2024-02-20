import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateLpAccFeeAccounts {
  lpAcc: PublicKey
  signerWalletAccount: PublicKey
  houseAcc: PublicKey
  pdaHouseAcc: PublicKey
  lpRevAcc: PublicKey
  systemProgram: PublicKey
  nftAcc: PublicKey
  usdcMint: PublicKey
  usdcHouseAcc: PublicKey
  usdcNftAcc: PublicKey
  usdcPdaHouseAcc: PublicKey
  tokenProgram: PublicKey
  associatedTokenProgram: PublicKey
}

export function updateLpAccFee(
  accounts: UpdateLpAccFeeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    {
      pubkey: accounts.signerWalletAccount,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.houseAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.lpRevAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.nftAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.usdcMint, isSigner: false, isWritable: true },
    { pubkey: accounts.usdcHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.usdcNftAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.usdcPdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
  ]
  const identifier = Buffer.from([87, 255, 229, 115, 80, 53, 203, 12])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
