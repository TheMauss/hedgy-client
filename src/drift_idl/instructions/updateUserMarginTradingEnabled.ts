import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateUserMarginTradingEnabledArgs {
  subAccountId: number;
  marginTradingEnabled: boolean;
}

export interface UpdateUserMarginTradingEnabledAccounts {
  user: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("subAccountId"),
  borsh.bool("marginTradingEnabled"),
]);

export function updateUserMarginTradingEnabled(
  args: UpdateUserMarginTradingEnabledArgs,
  accounts: UpdateUserMarginTradingEnabledAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([194, 92, 204, 223, 246, 188, 31, 203]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      subAccountId: args.subAccountId,
      marginTradingEnabled: args.marginTradingEnabled,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
