import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface InsuranceFundFields {
  vault: PublicKey;
  totalShares: BN;
  userShares: BN;
  sharesBase: BN;
  unstakingPeriod: BN;
  lastRevenueSettleTs: BN;
  revenueSettlePeriod: BN;
  totalFactor: number;
  userFactor: number;
}

export interface InsuranceFundJSON {
  vault: string;
  totalShares: string;
  userShares: string;
  sharesBase: string;
  unstakingPeriod: string;
  lastRevenueSettleTs: string;
  revenueSettlePeriod: string;
  totalFactor: number;
  userFactor: number;
}

export class InsuranceFund {
  readonly vault: PublicKey;
  readonly totalShares: BN;
  readonly userShares: BN;
  readonly sharesBase: BN;
  readonly unstakingPeriod: BN;
  readonly lastRevenueSettleTs: BN;
  readonly revenueSettlePeriod: BN;
  readonly totalFactor: number;
  readonly userFactor: number;

  constructor(fields: InsuranceFundFields) {
    this.vault = fields.vault;
    this.totalShares = fields.totalShares;
    this.userShares = fields.userShares;
    this.sharesBase = fields.sharesBase;
    this.unstakingPeriod = fields.unstakingPeriod;
    this.lastRevenueSettleTs = fields.lastRevenueSettleTs;
    this.revenueSettlePeriod = fields.revenueSettlePeriod;
    this.totalFactor = fields.totalFactor;
    this.userFactor = fields.userFactor;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.publicKey("vault"),
        borsh.u128("totalShares"),
        borsh.u128("userShares"),
        borsh.u128("sharesBase"),
        borsh.i64("unstakingPeriod"),
        borsh.i64("lastRevenueSettleTs"),
        borsh.i64("revenueSettlePeriod"),
        borsh.u32("totalFactor"),
        borsh.u32("userFactor"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new InsuranceFund({
      vault: obj.vault,
      totalShares: obj.totalShares,
      userShares: obj.userShares,
      sharesBase: obj.sharesBase,
      unstakingPeriod: obj.unstakingPeriod,
      lastRevenueSettleTs: obj.lastRevenueSettleTs,
      revenueSettlePeriod: obj.revenueSettlePeriod,
      totalFactor: obj.totalFactor,
      userFactor: obj.userFactor,
    });
  }

  static toEncodable(fields: InsuranceFundFields) {
    return {
      vault: fields.vault,
      totalShares: fields.totalShares,
      userShares: fields.userShares,
      sharesBase: fields.sharesBase,
      unstakingPeriod: fields.unstakingPeriod,
      lastRevenueSettleTs: fields.lastRevenueSettleTs,
      revenueSettlePeriod: fields.revenueSettlePeriod,
      totalFactor: fields.totalFactor,
      userFactor: fields.userFactor,
    };
  }

  toJSON(): InsuranceFundJSON {
    return {
      vault: this.vault.toString(),
      totalShares: this.totalShares.toString(),
      userShares: this.userShares.toString(),
      sharesBase: this.sharesBase.toString(),
      unstakingPeriod: this.unstakingPeriod.toString(),
      lastRevenueSettleTs: this.lastRevenueSettleTs.toString(),
      revenueSettlePeriod: this.revenueSettlePeriod.toString(),
      totalFactor: this.totalFactor,
      userFactor: this.userFactor,
    };
  }

  static fromJSON(obj: InsuranceFundJSON): InsuranceFund {
    return new InsuranceFund({
      vault: new PublicKey(obj.vault),
      totalShares: new BN(obj.totalShares),
      userShares: new BN(obj.userShares),
      sharesBase: new BN(obj.sharesBase),
      unstakingPeriod: new BN(obj.unstakingPeriod),
      lastRevenueSettleTs: new BN(obj.lastRevenueSettleTs),
      revenueSettlePeriod: new BN(obj.revenueSettlePeriod),
      totalFactor: obj.totalFactor,
      userFactor: obj.userFactor,
    });
  }

  toEncodable() {
    return InsuranceFund.toEncodable(this);
  }
}
