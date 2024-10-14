import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializePerpMarketArgs {
  marketIndex: number;
  ammBaseAssetReserve: BN;
  ammQuoteAssetReserve: BN;
  ammPeriodicity: BN;
  ammPegMultiplier: BN;
  oracleSource: types.OracleSourceKind;
  contractTier: types.ContractTierKind;
  marginRatioInitial: number;
  marginRatioMaintenance: number;
  liquidatorFee: number;
  ifLiquidationFee: number;
  imfFactor: number;
  activeStatus: boolean;
  baseSpread: number;
  maxSpread: number;
  maxOpenInterest: BN;
  maxRevenueWithdrawPerPeriod: BN;
  quoteMaxInsurance: BN;
  orderStepSize: BN;
  orderTickSize: BN;
  minOrderSize: BN;
  concentrationCoefScale: BN;
  curveUpdateIntensity: number;
  ammJitIntensity: number;
  name: Array<number>;
}

export interface InitializePerpMarketAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
  oracle: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("marketIndex"),
  borsh.u128("ammBaseAssetReserve"),
  borsh.u128("ammQuoteAssetReserve"),
  borsh.i64("ammPeriodicity"),
  borsh.u128("ammPegMultiplier"),
  types.OracleSource.layout("oracleSource"),
  types.ContractTier.layout("contractTier"),
  borsh.u32("marginRatioInitial"),
  borsh.u32("marginRatioMaintenance"),
  borsh.u32("liquidatorFee"),
  borsh.u32("ifLiquidationFee"),
  borsh.u32("imfFactor"),
  borsh.bool("activeStatus"),
  borsh.u32("baseSpread"),
  borsh.u32("maxSpread"),
  borsh.u128("maxOpenInterest"),
  borsh.u64("maxRevenueWithdrawPerPeriod"),
  borsh.u64("quoteMaxInsurance"),
  borsh.u64("orderStepSize"),
  borsh.u64("orderTickSize"),
  borsh.u64("minOrderSize"),
  borsh.u128("concentrationCoefScale"),
  borsh.u8("curveUpdateIntensity"),
  borsh.u8("ammJitIntensity"),
  borsh.array(borsh.u8(), 32, "name"),
]);

export function initializePerpMarket(
  args: InitializePerpMarketArgs,
  accounts: InitializePerpMarketAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.oracle, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([132, 9, 229, 118, 117, 118, 117, 62]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketIndex: args.marketIndex,
      ammBaseAssetReserve: args.ammBaseAssetReserve,
      ammQuoteAssetReserve: args.ammQuoteAssetReserve,
      ammPeriodicity: args.ammPeriodicity,
      ammPegMultiplier: args.ammPegMultiplier,
      oracleSource: args.oracleSource.toEncodable(),
      contractTier: args.contractTier.toEncodable(),
      marginRatioInitial: args.marginRatioInitial,
      marginRatioMaintenance: args.marginRatioMaintenance,
      liquidatorFee: args.liquidatorFee,
      ifLiquidationFee: args.ifLiquidationFee,
      imfFactor: args.imfFactor,
      activeStatus: args.activeStatus,
      baseSpread: args.baseSpread,
      maxSpread: args.maxSpread,
      maxOpenInterest: args.maxOpenInterest,
      maxRevenueWithdrawPerPeriod: args.maxRevenueWithdrawPerPeriod,
      quoteMaxInsurance: args.quoteMaxInsurance,
      orderStepSize: args.orderStepSize,
      orderTickSize: args.orderTickSize,
      minOrderSize: args.minOrderSize,
      concentrationCoefScale: args.concentrationCoefScale,
      curveUpdateIntensity: args.curveUpdateIntensity,
      ammJitIntensity: args.ammJitIntensity,
      name: args.name,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
