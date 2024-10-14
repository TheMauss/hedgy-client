import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CancelOrderArgs {
  orderId: number | null;
}

export interface CancelOrderAccounts {
  state: PublicKey;
  user: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([borsh.option(borsh.u32(), "orderId")]);

export function cancelOrder(
  args: CancelOrderArgs,
  accounts: CancelOrderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([95, 129, 237, 240, 8, 49, 223, 132]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      orderId: args.orderId,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
