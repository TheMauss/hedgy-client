import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketScaleInitialAssetWeightStartArgs {
  scaleInitialAssetWeightStart: BN;
}

export interface UpdateSpotMarketScaleInitialAssetWeightStartAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
}

export const layout = borsh.struct([borsh.u64("scaleInitialAssetWeightStart")]);

export function updateSpotMarketScaleInitialAssetWeightStart(
  args: UpdateSpotMarketScaleInitialAssetWeightStartArgs,
  accounts: UpdateSpotMarketScaleInitialAssetWeightStartAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([217, 204, 204, 118, 204, 130, 225, 147]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      scaleInitialAssetWeightStart: args.scaleInitialAssetWeightStart,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
