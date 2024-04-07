import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ClaimPointsArgs {
  affiliateCode: Array<number>;
}

export interface ClaimPointsAccounts {
  liqProvider: PublicKey;
  userAcc: PublicKey;
  providersWallet: PublicKey;
  lpAcc: PublicKey;
  signerWalletAccount: PublicKey;
  ratioAcc: PublicKey;
  houseAcc: PublicKey;
  mint: PublicKey;
  solOracleAccount: PublicKey;
  systemProgram: PublicKey;
  affilAcc: PublicKey;
}

export const layout = borsh.struct([
  borsh.array(borsh.u8(), 8, "affiliateCode"),
]);

export function claimPoints(
  args: ClaimPointsArgs,
  accounts: ClaimPointsAccounts,
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
    { pubkey: accounts.mint, isSigner: false, isWritable: true },
    { pubkey: accounts.solOracleAccount, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.affilAcc, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([106, 26, 99, 252, 9, 196, 78, 172]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      affiliateCode: args.affiliateCode,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
