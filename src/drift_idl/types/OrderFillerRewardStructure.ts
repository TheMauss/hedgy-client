import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface OrderFillerRewardStructureFields {
  rewardNumerator: number;
  rewardDenominator: number;
  timeBasedRewardLowerBound: BN;
}

export interface OrderFillerRewardStructureJSON {
  rewardNumerator: number;
  rewardDenominator: number;
  timeBasedRewardLowerBound: string;
}

export class OrderFillerRewardStructure {
  readonly rewardNumerator: number;
  readonly rewardDenominator: number;
  readonly timeBasedRewardLowerBound: BN;

  constructor(fields: OrderFillerRewardStructureFields) {
    this.rewardNumerator = fields.rewardNumerator;
    this.rewardDenominator = fields.rewardDenominator;
    this.timeBasedRewardLowerBound = fields.timeBasedRewardLowerBound;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u32("rewardNumerator"),
        borsh.u32("rewardDenominator"),
        borsh.u128("timeBasedRewardLowerBound"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new OrderFillerRewardStructure({
      rewardNumerator: obj.rewardNumerator,
      rewardDenominator: obj.rewardDenominator,
      timeBasedRewardLowerBound: obj.timeBasedRewardLowerBound,
    });
  }

  static toEncodable(fields: OrderFillerRewardStructureFields) {
    return {
      rewardNumerator: fields.rewardNumerator,
      rewardDenominator: fields.rewardDenominator,
      timeBasedRewardLowerBound: fields.timeBasedRewardLowerBound,
    };
  }

  toJSON(): OrderFillerRewardStructureJSON {
    return {
      rewardNumerator: this.rewardNumerator,
      rewardDenominator: this.rewardDenominator,
      timeBasedRewardLowerBound: this.timeBasedRewardLowerBound.toString(),
    };
  }

  static fromJSON(
    obj: OrderFillerRewardStructureJSON
  ): OrderFillerRewardStructure {
    return new OrderFillerRewardStructure({
      rewardNumerator: obj.rewardNumerator,
      rewardDenominator: obj.rewardDenominator,
      timeBasedRewardLowerBound: new BN(obj.timeBasedRewardLowerBound),
    });
  }

  toEncodable() {
    return OrderFillerRewardStructure.toEncodable(this);
  }
}
