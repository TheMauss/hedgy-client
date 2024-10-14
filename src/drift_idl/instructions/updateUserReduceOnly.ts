import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateUserReduceOnlyArgs {
  subAccountId: number;
  reduceOnly: boolean;
}

export interface UpdateUserReduceOnlyAccounts {
  user: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("subAccountId"),
  borsh.bool("reduceOnly"),
]);

export function updateUserReduceOnly(
  args: UpdateUserReduceOnlyArgs,
  accounts: UpdateUserReduceOnlyAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([199, 71, 42, 67, 144, 19, 86, 109]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      subAccountId: args.subAccountId,
      reduceOnly: args.reduceOnly,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
