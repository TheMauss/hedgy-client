import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateUserNameArgs {
  subAccountId: number;
  name: Array<number>;
}

export interface UpdateUserNameAccounts {
  user: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("subAccountId"),
  borsh.array(borsh.u8(), 32, "name"),
]);

export function updateUserName(
  args: UpdateUserNameArgs,
  accounts: UpdateUserNameAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([135, 25, 185, 56, 165, 53, 34, 136]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      subAccountId: args.subAccountId,
      name: args.name,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
