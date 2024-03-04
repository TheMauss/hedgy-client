import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface StakeAndMintTokensArgs {
  depositAmount: BN;
  usdc: number;
}

export interface StakeAndMintTokensAccounts {
  providersWallet: PublicKey;
  lpAcc: PublicKey;
  signerWalletAccount: PublicKey;
  houseAcc: PublicKey;
  pdaHouseAcc: PublicKey;
  mint: PublicKey;
  usdcMint: PublicKey;
  providersSplTokenAccount: PublicKey;
  usdcProvidersWallet: PublicKey;
  usdcPdaHouseAcc: PublicKey;
  associatedTokenProgram: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("depositAmount"),
  borsh.u8("usdc"),
]);

export function stakeAndMintTokens(
  args: StakeAndMintTokensArgs,
  accounts: StakeAndMintTokensAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.providersWallet, isSigner: true, isWritable: true },
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    {
      pubkey: accounts.signerWalletAccount,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: false },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: true },
    { pubkey: accounts.usdcMint, isSigner: false, isWritable: true },
    {
      pubkey: accounts.providersSplTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.usdcProvidersWallet, isSigner: false, isWritable: true },
    { pubkey: accounts.usdcPdaHouseAcc, isSigner: false, isWritable: true },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([145, 192, 53, 161, 190, 10, 19, 77]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      depositAmount: args.depositAmount,
      usdc: args.usdc,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
