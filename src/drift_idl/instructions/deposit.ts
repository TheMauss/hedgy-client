import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface DepositArgs {
  marketIndex: number;
  amount: BN;
  reduceOnly: boolean;
}

export interface DepositAccounts {
  state: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
  authority: PublicKey;
  spotMarketVault: PublicKey;
  userTokenAccount: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("marketIndex"),
  borsh.u64("amount"),
  borsh.bool("reduceOnly"),
]);

export function deposit(
  args: DepositArgs,
  accounts: DepositAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.spotMarketVault, isSigner: false, isWritable: true },
    { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketIndex: args.marketIndex,
      amount: args.amount,
      reduceOnly: args.reduceOnly,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
