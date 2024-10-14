import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketExpiryArgs {
  expiryTs: BN;
}

export interface UpdateSpotMarketExpiryAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
}

export const layout = borsh.struct([borsh.i64("expiryTs")]);

export function updateSpotMarketExpiry(
  args: UpdateSpotMarketExpiryArgs,
  accounts: UpdateSpotMarketExpiryAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([208, 11, 211, 159, 226, 24, 11, 247]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      expiryTs: args.expiryTs,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
