import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateStateMaxInitializeUserFeeArgs {
  maxInitializeUserFee: number;
}

export interface UpdateStateMaxInitializeUserFeeAccounts {
  admin: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([borsh.u16("maxInitializeUserFee")]);

export function updateStateMaxInitializeUserFee(
  args: UpdateStateMaxInitializeUserFeeArgs,
  accounts: UpdateStateMaxInitializeUserFeeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([237, 225, 25, 237, 193, 45, 77, 97]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      maxInitializeUserFee: args.maxInitializeUserFee,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
