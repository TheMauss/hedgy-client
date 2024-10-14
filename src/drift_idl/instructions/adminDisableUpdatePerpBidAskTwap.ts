import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface AdminDisableUpdatePerpBidAskTwapArgs {
  disable: boolean;
}

export interface AdminDisableUpdatePerpBidAskTwapAccounts {
  admin: PublicKey;
  state: PublicKey;
  userStats: PublicKey;
}

export const layout = borsh.struct([borsh.bool("disable")]);

export function adminDisableUpdatePerpBidAskTwap(
  args: AdminDisableUpdatePerpBidAskTwapArgs,
  accounts: AdminDisableUpdatePerpBidAskTwapAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([17, 164, 82, 45, 183, 86, 191, 199]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      disable: args.disable,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
