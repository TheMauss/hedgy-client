import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface FeeTierFields {
  feeNumerator: number;
  feeDenominator: number;
  makerRebateNumerator: number;
  makerRebateDenominator: number;
  referrerRewardNumerator: number;
  referrerRewardDenominator: number;
  refereeFeeNumerator: number;
  refereeFeeDenominator: number;
}

export interface FeeTierJSON {
  feeNumerator: number;
  feeDenominator: number;
  makerRebateNumerator: number;
  makerRebateDenominator: number;
  referrerRewardNumerator: number;
  referrerRewardDenominator: number;
  refereeFeeNumerator: number;
  refereeFeeDenominator: number;
}

export class FeeTier {
  readonly feeNumerator: number;
  readonly feeDenominator: number;
  readonly makerRebateNumerator: number;
  readonly makerRebateDenominator: number;
  readonly referrerRewardNumerator: number;
  readonly referrerRewardDenominator: number;
  readonly refereeFeeNumerator: number;
  readonly refereeFeeDenominator: number;

  constructor(fields: FeeTierFields) {
    this.feeNumerator = fields.feeNumerator;
    this.feeDenominator = fields.feeDenominator;
    this.makerRebateNumerator = fields.makerRebateNumerator;
    this.makerRebateDenominator = fields.makerRebateDenominator;
    this.referrerRewardNumerator = fields.referrerRewardNumerator;
    this.referrerRewardDenominator = fields.referrerRewardDenominator;
    this.refereeFeeNumerator = fields.refereeFeeNumerator;
    this.refereeFeeDenominator = fields.refereeFeeDenominator;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u32("feeNumerator"),
        borsh.u32("feeDenominator"),
        borsh.u32("makerRebateNumerator"),
        borsh.u32("makerRebateDenominator"),
        borsh.u32("referrerRewardNumerator"),
        borsh.u32("referrerRewardDenominator"),
        borsh.u32("refereeFeeNumerator"),
        borsh.u32("refereeFeeDenominator"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new FeeTier({
      feeNumerator: obj.feeNumerator,
      feeDenominator: obj.feeDenominator,
      makerRebateNumerator: obj.makerRebateNumerator,
      makerRebateDenominator: obj.makerRebateDenominator,
      referrerRewardNumerator: obj.referrerRewardNumerator,
      referrerRewardDenominator: obj.referrerRewardDenominator,
      refereeFeeNumerator: obj.refereeFeeNumerator,
      refereeFeeDenominator: obj.refereeFeeDenominator,
    });
  }

  static toEncodable(fields: FeeTierFields) {
    return {
      feeNumerator: fields.feeNumerator,
      feeDenominator: fields.feeDenominator,
      makerRebateNumerator: fields.makerRebateNumerator,
      makerRebateDenominator: fields.makerRebateDenominator,
      referrerRewardNumerator: fields.referrerRewardNumerator,
      referrerRewardDenominator: fields.referrerRewardDenominator,
      refereeFeeNumerator: fields.refereeFeeNumerator,
      refereeFeeDenominator: fields.refereeFeeDenominator,
    };
  }

  toJSON(): FeeTierJSON {
    return {
      feeNumerator: this.feeNumerator,
      feeDenominator: this.feeDenominator,
      makerRebateNumerator: this.makerRebateNumerator,
      makerRebateDenominator: this.makerRebateDenominator,
      referrerRewardNumerator: this.referrerRewardNumerator,
      referrerRewardDenominator: this.referrerRewardDenominator,
      refereeFeeNumerator: this.refereeFeeNumerator,
      refereeFeeDenominator: this.refereeFeeDenominator,
    };
  }

  static fromJSON(obj: FeeTierJSON): FeeTier {
    return new FeeTier({
      feeNumerator: obj.feeNumerator,
      feeDenominator: obj.feeDenominator,
      makerRebateNumerator: obj.makerRebateNumerator,
      makerRebateDenominator: obj.makerRebateDenominator,
      referrerRewardNumerator: obj.referrerRewardNumerator,
      referrerRewardDenominator: obj.referrerRewardDenominator,
      refereeFeeNumerator: obj.refereeFeeNumerator,
      refereeFeeDenominator: obj.refereeFeeDenominator,
    });
  }

  toEncodable() {
    return FeeTier.toEncodable(this);
  }
}
