import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpAuctionDurationArgs {
  minPerpAuctionDuration: number;
}

export interface UpdatePerpAuctionDurationAccounts {
  admin: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([borsh.u8("minPerpAuctionDuration")]);

export function updatePerpAuctionDuration(
  args: UpdatePerpAuctionDurationArgs,
  accounts: UpdatePerpAuctionDurationAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([126, 110, 52, 174, 30, 206, 215, 90]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      minPerpAuctionDuration: args.minPerpAuctionDuration,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
