import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializeSpotMarketArgs {
  optimalUtilization: number;
  optimalBorrowRate: number;
  maxBorrowRate: number;
  oracleSource: types.OracleSourceKind;
  initialAssetWeight: number;
  maintenanceAssetWeight: number;
  initialLiabilityWeight: number;
  maintenanceLiabilityWeight: number;
  imfFactor: number;
  liquidatorFee: number;
  ifLiquidationFee: number;
  activeStatus: boolean;
  assetTier: types.AssetTierKind;
  scaleInitialAssetWeightStart: BN;
  withdrawGuardThreshold: BN;
  orderTickSize: BN;
  orderStepSize: BN;
  ifTotalFactor: number;
  name: Array<number>;
}

export interface InitializeSpotMarketAccounts {
  spotMarket: PublicKey;
  spotMarketMint: PublicKey;
  spotMarketVault: PublicKey;
  insuranceFundVault: PublicKey;
  driftSigner: PublicKey;
  state: PublicKey;
  oracle: PublicKey;
  admin: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.u32("optimalUtilization"),
  borsh.u32("optimalBorrowRate"),
  borsh.u32("maxBorrowRate"),
  types.OracleSource.layout("oracleSource"),
  borsh.u32("initialAssetWeight"),
  borsh.u32("maintenanceAssetWeight"),
  borsh.u32("initialLiabilityWeight"),
  borsh.u32("maintenanceLiabilityWeight"),
  borsh.u32("imfFactor"),
  borsh.u32("liquidatorFee"),
  borsh.u32("ifLiquidationFee"),
  borsh.bool("activeStatus"),
  types.AssetTier.layout("assetTier"),
  borsh.u64("scaleInitialAssetWeightStart"),
  borsh.u64("withdrawGuardThreshold"),
  borsh.u64("orderTickSize"),
  borsh.u64("orderStepSize"),
  borsh.u32("ifTotalFactor"),
  borsh.array(borsh.u8(), 32, "name"),
]);

export function initializeSpotMarket(
  args: InitializeSpotMarketArgs,
  accounts: InitializeSpotMarketAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.spotMarketMint, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarketVault, isSigner: false, isWritable: true },
    { pubkey: accounts.insuranceFundVault, isSigner: false, isWritable: true },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
    { pubkey: accounts.oracle, isSigner: false, isWritable: false },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([234, 196, 128, 44, 94, 15, 48, 201]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      optimalUtilization: args.optimalUtilization,
      optimalBorrowRate: args.optimalBorrowRate,
      maxBorrowRate: args.maxBorrowRate,
      oracleSource: args.oracleSource.toEncodable(),
      initialAssetWeight: args.initialAssetWeight,
      maintenanceAssetWeight: args.maintenanceAssetWeight,
      initialLiabilityWeight: args.initialLiabilityWeight,
      maintenanceLiabilityWeight: args.maintenanceLiabilityWeight,
      imfFactor: args.imfFactor,
      liquidatorFee: args.liquidatorFee,
      ifLiquidationFee: args.ifLiquidationFee,
      activeStatus: args.activeStatus,
      assetTier: args.assetTier.toEncodable(),
      scaleInitialAssetWeightStart: args.scaleInitialAssetWeightStart,
      withdrawGuardThreshold: args.withdrawGuardThreshold,
      orderTickSize: args.orderTickSize,
      orderStepSize: args.orderStepSize,
      ifTotalFactor: args.ifTotalFactor,
      name: args.name,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
