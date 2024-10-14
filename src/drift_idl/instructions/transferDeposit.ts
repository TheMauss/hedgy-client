import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface TransferDepositArgs {
  marketIndex: number;
  amount: BN;
}

export interface TransferDepositAccounts {
  fromUser: PublicKey;
  toUser: PublicKey;
  userStats: PublicKey;
  authority: PublicKey;
  state: PublicKey;
  spotMarketVault: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("marketIndex"),
  borsh.u64("amount"),
]);

export function transferDeposit(
  args: TransferDepositArgs,
  accounts: TransferDepositAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.fromUser, isSigner: false, isWritable: true },
    { pubkey: accounts.toUser, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarketVault, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([20, 20, 147, 223, 41, 63, 204, 111]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketIndex: args.marketIndex,
      amount: args.amount,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
