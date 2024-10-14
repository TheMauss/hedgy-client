import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketUnrealizedAssetWeightArgs {
  unrealizedInitialAssetWeight: number;
  unrealizedMaintenanceAssetWeight: number;
}

export interface UpdatePerpMarketUnrealizedAssetWeightAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u32("unrealizedInitialAssetWeight"),
  borsh.u32("unrealizedMaintenanceAssetWeight"),
]);

export function updatePerpMarketUnrealizedAssetWeight(
  args: UpdatePerpMarketUnrealizedAssetWeightArgs,
  accounts: UpdatePerpMarketUnrealizedAssetWeightAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([135, 132, 205, 165, 109, 150, 166, 106]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      unrealizedInitialAssetWeight: args.unrealizedInitialAssetWeight,
      unrealizedMaintenanceAssetWeight: args.unrealizedMaintenanceAssetWeight,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
