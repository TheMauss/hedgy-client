import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateStateMaxNumberOfSubAccountsArgs {
  maxNumberOfSubAccounts: number;
}

export interface UpdateStateMaxNumberOfSubAccountsAccounts {
  admin: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([borsh.u16("maxNumberOfSubAccounts")]);

export function updateStateMaxNumberOfSubAccounts(
  args: UpdateStateMaxNumberOfSubAccountsArgs,
  accounts: UpdateStateMaxNumberOfSubAccountsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([155, 123, 214, 2, 221, 166, 204, 85]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      maxNumberOfSubAccounts: args.maxNumberOfSubAccounts,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
