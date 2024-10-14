import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketMarginWeightsArgs {
  initialAssetWeight: number;
  maintenanceAssetWeight: number;
  initialLiabilityWeight: number;
  maintenanceLiabilityWeight: number;
  imfFactor: number;
}

export interface UpdateSpotMarketMarginWeightsAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u32("initialAssetWeight"),
  borsh.u32("maintenanceAssetWeight"),
  borsh.u32("initialLiabilityWeight"),
  borsh.u32("maintenanceLiabilityWeight"),
  borsh.u32("imfFactor"),
]);

export function updateSpotMarketMarginWeights(
  args: UpdateSpotMarketMarginWeightsArgs,
  accounts: UpdateSpotMarketMarginWeightsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([109, 33, 87, 195, 255, 36, 6, 81]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      initialAssetWeight: args.initialAssetWeight,
      maintenanceAssetWeight: args.maintenanceAssetWeight,
      initialLiabilityWeight: args.initialLiabilityWeight,
      maintenanceLiabilityWeight: args.maintenanceLiabilityWeight,
      imfFactor: args.imfFactor,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
