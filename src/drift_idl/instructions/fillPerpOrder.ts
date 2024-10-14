import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface FillPerpOrderArgs {
  orderId: number | null;
  makerOrderId: number | null;
}

export interface FillPerpOrderAccounts {
  state: PublicKey;
  authority: PublicKey;
  filler: PublicKey;
  fillerStats: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
}

export const layout = borsh.struct([
  borsh.option(borsh.u32(), "orderId"),
  borsh.option(borsh.u32(), "makerOrderId"),
]);

export function fillPerpOrder(
  args: FillPerpOrderArgs,
  accounts: FillPerpOrderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.filler, isSigner: false, isWritable: true },
    { pubkey: accounts.fillerStats, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([13, 188, 248, 103, 134, 217, 106, 240]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      orderId: args.orderId,
      makerOrderId: args.makerOrderId,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
