import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketRevenueSettlePeriodArgs {
  revenueSettlePeriod: BN;
}

export interface UpdateSpotMarketRevenueSettlePeriodAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
}

export const layout = borsh.struct([borsh.i64("revenueSettlePeriod")]);

export function updateSpotMarketRevenueSettlePeriod(
  args: UpdateSpotMarketRevenueSettlePeriodArgs,
  accounts: UpdateSpotMarketRevenueSettlePeriodAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([81, 92, 126, 41, 250, 225, 156, 219]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      revenueSettlePeriod: args.revenueSettlePeriod,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
