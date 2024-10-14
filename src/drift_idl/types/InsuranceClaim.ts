import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface InsuranceClaimFields {
  /**
   * The amount of revenue last settled
   * Positive if funds left the perp market,
   * negative if funds were pulled into the perp market
   * precision: QUOTE_PRECISION
   */
  revenueWithdrawSinceLastSettle: BN;
  /**
   * The max amount of revenue that can be withdrawn per period
   * precision: QUOTE_PRECISION
   */
  maxRevenueWithdrawPerPeriod: BN;
  /**
   * The max amount of insurance that perp market can use to resolve bankruptcy and pnl deficits
   * precision: QUOTE_PRECISION
   */
  quoteMaxInsurance: BN;
  /**
   * The amount of insurance that has been used to resolve bankruptcy and pnl deficits
   * precision: QUOTE_PRECISION
   */
  quoteSettledInsurance: BN;
  /** The last time revenue was settled in/out of market */
  lastRevenueWithdrawTs: BN;
}

export interface InsuranceClaimJSON {
  /**
   * The amount of revenue last settled
   * Positive if funds left the perp market,
   * negative if funds were pulled into the perp market
   * precision: QUOTE_PRECISION
   */
  revenueWithdrawSinceLastSettle: string;
  /**
   * The max amount of revenue that can be withdrawn per period
   * precision: QUOTE_PRECISION
   */
  maxRevenueWithdrawPerPeriod: string;
  /**
   * The max amount of insurance that perp market can use to resolve bankruptcy and pnl deficits
   * precision: QUOTE_PRECISION
   */
  quoteMaxInsurance: string;
  /**
   * The amount of insurance that has been used to resolve bankruptcy and pnl deficits
   * precision: QUOTE_PRECISION
   */
  quoteSettledInsurance: string;
  /** The last time revenue was settled in/out of market */
  lastRevenueWithdrawTs: string;
}

export class InsuranceClaim {
  /**
   * The amount of revenue last settled
   * Positive if funds left the perp market,
   * negative if funds were pulled into the perp market
   * precision: QUOTE_PRECISION
   */
  readonly revenueWithdrawSinceLastSettle: BN;
  /**
   * The max amount of revenue that can be withdrawn per period
   * precision: QUOTE_PRECISION
   */
  readonly maxRevenueWithdrawPerPeriod: BN;
  /**
   * The max amount of insurance that perp market can use to resolve bankruptcy and pnl deficits
   * precision: QUOTE_PRECISION
   */
  readonly quoteMaxInsurance: BN;
  /**
   * The amount of insurance that has been used to resolve bankruptcy and pnl deficits
   * precision: QUOTE_PRECISION
   */
  readonly quoteSettledInsurance: BN;
  /** The last time revenue was settled in/out of market */
  readonly lastRevenueWithdrawTs: BN;

  constructor(fields: InsuranceClaimFields) {
    this.revenueWithdrawSinceLastSettle = fields.revenueWithdrawSinceLastSettle;
    this.maxRevenueWithdrawPerPeriod = fields.maxRevenueWithdrawPerPeriod;
    this.quoteMaxInsurance = fields.quoteMaxInsurance;
    this.quoteSettledInsurance = fields.quoteSettledInsurance;
    this.lastRevenueWithdrawTs = fields.lastRevenueWithdrawTs;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.i64("revenueWithdrawSinceLastSettle"),
        borsh.u64("maxRevenueWithdrawPerPeriod"),
        borsh.u64("quoteMaxInsurance"),
        borsh.u64("quoteSettledInsurance"),
        borsh.i64("lastRevenueWithdrawTs"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new InsuranceClaim({
      revenueWithdrawSinceLastSettle: obj.revenueWithdrawSinceLastSettle,
      maxRevenueWithdrawPerPeriod: obj.maxRevenueWithdrawPerPeriod,
      quoteMaxInsurance: obj.quoteMaxInsurance,
      quoteSettledInsurance: obj.quoteSettledInsurance,
      lastRevenueWithdrawTs: obj.lastRevenueWithdrawTs,
    });
  }

  static toEncodable(fields: InsuranceClaimFields) {
    return {
      revenueWithdrawSinceLastSettle: fields.revenueWithdrawSinceLastSettle,
      maxRevenueWithdrawPerPeriod: fields.maxRevenueWithdrawPerPeriod,
      quoteMaxInsurance: fields.quoteMaxInsurance,
      quoteSettledInsurance: fields.quoteSettledInsurance,
      lastRevenueWithdrawTs: fields.lastRevenueWithdrawTs,
    };
  }

  toJSON(): InsuranceClaimJSON {
    return {
      revenueWithdrawSinceLastSettle:
        this.revenueWithdrawSinceLastSettle.toString(),
      maxRevenueWithdrawPerPeriod: this.maxRevenueWithdrawPerPeriod.toString(),
      quoteMaxInsurance: this.quoteMaxInsurance.toString(),
      quoteSettledInsurance: this.quoteSettledInsurance.toString(),
      lastRevenueWithdrawTs: this.lastRevenueWithdrawTs.toString(),
    };
  }

  static fromJSON(obj: InsuranceClaimJSON): InsuranceClaim {
    return new InsuranceClaim({
      revenueWithdrawSinceLastSettle: new BN(
        obj.revenueWithdrawSinceLastSettle
      ),
      maxRevenueWithdrawPerPeriod: new BN(obj.maxRevenueWithdrawPerPeriod),
      quoteMaxInsurance: new BN(obj.quoteMaxInsurance),
      quoteSettledInsurance: new BN(obj.quoteSettledInsurance),
      lastRevenueWithdrawTs: new BN(obj.lastRevenueWithdrawTs),
    });
  }

  toEncodable() {
    return InsuranceClaim.toEncodable(this);
  }
}
