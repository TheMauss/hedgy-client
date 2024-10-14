import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketPausedOperationsArgs {
  pausedOperations: number;
}

export interface UpdateSpotMarketPausedOperationsAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
}

export const layout = borsh.struct([borsh.u8("pausedOperations")]);

export function updateSpotMarketPausedOperations(
  args: UpdateSpotMarketPausedOperationsArgs,
  accounts: UpdateSpotMarketPausedOperationsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([100, 61, 153, 81, 180, 12, 6, 248]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      pausedOperations: args.pausedOperations,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
