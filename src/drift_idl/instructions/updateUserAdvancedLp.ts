import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateUserAdvancedLpArgs {
  subAccountId: number;
  advancedLp: boolean;
}

export interface UpdateUserAdvancedLpAccounts {
  user: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("subAccountId"),
  borsh.bool("advancedLp"),
]);

export function updateUserAdvancedLp(
  args: UpdateUserAdvancedLpArgs,
  accounts: UpdateUserAdvancedLpAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([66, 80, 107, 186, 27, 242, 66, 95]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      subAccountId: args.subAccountId,
      advancedLp: args.advancedLp,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
