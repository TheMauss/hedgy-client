import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface TriggerOrderArgs {
  orderId: number;
}

export interface TriggerOrderAccounts {
  state: PublicKey;
  authority: PublicKey;
  filler: PublicKey;
  user: PublicKey;
}

export const layout = borsh.struct([borsh.u32("orderId")]);

export function triggerOrder(
  args: TriggerOrderArgs,
  accounts: TriggerOrderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.filler, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([63, 112, 51, 233, 232, 47, 240, 199]);
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
