import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface StakeForPointsArgs {
  depositAmount: BN;
  usdc: number;
}

export interface StakeForPointsAccounts {
  liqProvider: PublicKey;
  userAcc: PublicKey;
  providersWallet: PublicKey;
  lpAcc: PublicKey;
  signerWalletAccount: PublicKey;
  ratioAcc: PublicKey;
  houseAcc: PublicKey;
  pdaHouseAcc: PublicKey;
  mint: PublicKey;
  solOracleAccount: PublicKey;
  providersSplTokenAccount: PublicKey;
  splPdaHouseAcc: PublicKey;
  associatedTokenProgram: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("depositAmount"),
  borsh.u8("usdc"),
]);

export function stakeForPoints(
  args: StakeForPointsArgs,
  accounts: StakeForPointsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.liqProvider, isSigner: false, isWritable: true },
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
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
    { pubkey: accounts.mint, isSigner: false, isWritable: true },
    { pubkey: accounts.solOracleAccount, isSigner: false, isWritable: false },
    {
      pubkey: accounts.providersSplTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.splPdaHouseAcc, isSigner: false, isWritable: true },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([8, 117, 14, 251, 187, 192, 135, 230]);
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
