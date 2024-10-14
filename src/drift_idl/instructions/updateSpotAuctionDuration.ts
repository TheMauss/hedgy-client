import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotAuctionDurationArgs {
  defaultSpotAuctionDuration: number;
}

export interface UpdateSpotAuctionDurationAccounts {
  admin: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([borsh.u8("defaultSpotAuctionDuration")]);

export function updateSpotAuctionDuration(
  args: UpdateSpotAuctionDurationArgs,
  accounts: UpdateSpotAuctionDurationAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([182, 178, 203, 72, 187, 143, 157, 107]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      defaultSpotAuctionDuration: args.defaultSpotAuctionDuration,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
