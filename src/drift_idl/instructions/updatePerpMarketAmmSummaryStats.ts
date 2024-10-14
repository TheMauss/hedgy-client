import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketAmmSummaryStatsArgs {
  params: types.UpdatePerpMarketSummaryStatsParamsFields;
}

export interface UpdatePerpMarketAmmSummaryStatsAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
  spotMarket: PublicKey;
  oracle: PublicKey;
}

export const layout = borsh.struct([
  types.UpdatePerpMarketSummaryStatsParams.layout("params"),
]);

export function updatePerpMarketAmmSummaryStats(
  args: UpdatePerpMarketAmmSummaryStatsArgs,
  accounts: UpdatePerpMarketAmmSummaryStatsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.oracle, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([122, 101, 249, 238, 209, 9, 241, 245]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.UpdatePerpMarketSummaryStatsParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
