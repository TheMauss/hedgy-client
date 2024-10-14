import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketBorrowRateArgs {
  optimalUtilization: number;
  optimalBorrowRate: number;
  maxBorrowRate: number;
  minBorrowRate: number | null;
}

export interface UpdateSpotMarketBorrowRateAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u32("optimalUtilization"),
  borsh.u32("optimalBorrowRate"),
  borsh.u32("maxBorrowRate"),
  borsh.option(borsh.u8(), "minBorrowRate"),
]);

export function updateSpotMarketBorrowRate(
  args: UpdateSpotMarketBorrowRateArgs,
  accounts: UpdateSpotMarketBorrowRateAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([71, 239, 236, 153, 210, 62, 254, 76]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      optimalUtilization: args.optimalUtilization,
      optimalBorrowRate: args.optimalBorrowRate,
      maxBorrowRate: args.maxBorrowRate,
      minBorrowRate: args.minBorrowRate,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
