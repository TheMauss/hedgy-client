import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface UserFeesFields {
  /**
   * Total taker fee paid
   * precision: QUOTE_PRECISION
   */
  totalFeePaid: BN;
  /**
   * Total maker fee rebate
   * precision: QUOTE_PRECISION
   */
  totalFeeRebate: BN;
  /**
   * Total discount from holding token
   * precision: QUOTE_PRECISION
   */
  totalTokenDiscount: BN;
  /**
   * Total discount from being referred
   * precision: QUOTE_PRECISION
   */
  totalRefereeDiscount: BN;
  /**
   * Total reward to referrer
   * precision: QUOTE_PRECISION
   */
  totalReferrerReward: BN;
  /**
   * Total reward to referrer this epoch
   * precision: QUOTE_PRECISION
   */
  currentEpochReferrerReward: BN;
}

export interface UserFeesJSON {
  /**
   * Total taker fee paid
   * precision: QUOTE_PRECISION
   */
  totalFeePaid: string;
  /**
   * Total maker fee rebate
   * precision: QUOTE_PRECISION
   */
  totalFeeRebate: string;
  /**
   * Total discount from holding token
   * precision: QUOTE_PRECISION
   */
  totalTokenDiscount: string;
  /**
   * Total discount from being referred
   * precision: QUOTE_PRECISION
   */
  totalRefereeDiscount: string;
  /**
   * Total reward to referrer
   * precision: QUOTE_PRECISION
   */
  totalReferrerReward: string;
  /**
   * Total reward to referrer this epoch
   * precision: QUOTE_PRECISION
   */
  currentEpochReferrerReward: string;
}

export class UserFees {
  /**
   * Total taker fee paid
   * precision: QUOTE_PRECISION
   */
  readonly totalFeePaid: BN;
  /**
   * Total maker fee rebate
   * precision: QUOTE_PRECISION
   */
  readonly totalFeeRebate: BN;
  /**
   * Total discount from holding token
   * precision: QUOTE_PRECISION
   */
  readonly totalTokenDiscount: BN;
  /**
   * Total discount from being referred
   * precision: QUOTE_PRECISION
   */
  readonly totalRefereeDiscount: BN;
  /**
   * Total reward to referrer
   * precision: QUOTE_PRECISION
   */
  readonly totalReferrerReward: BN;
  /**
   * Total reward to referrer this epoch
   * precision: QUOTE_PRECISION
   */
  readonly currentEpochReferrerReward: BN;

  constructor(fields: UserFeesFields) {
    this.totalFeePaid = fields.totalFeePaid;
    this.totalFeeRebate = fields.totalFeeRebate;
    this.totalTokenDiscount = fields.totalTokenDiscount;
    this.totalRefereeDiscount = fields.totalRefereeDiscount;
    this.totalReferrerReward = fields.totalReferrerReward;
    this.currentEpochReferrerReward = fields.currentEpochReferrerReward;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("totalFeePaid"),
        borsh.u64("totalFeeRebate"),
        borsh.u64("totalTokenDiscount"),
        borsh.u64("totalRefereeDiscount"),
        borsh.u64("totalReferrerReward"),
        borsh.u64("currentEpochReferrerReward"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new UserFees({
      totalFeePaid: obj.totalFeePaid,
      totalFeeRebate: obj.totalFeeRebate,
      totalTokenDiscount: obj.totalTokenDiscount,
      totalRefereeDiscount: obj.totalRefereeDiscount,
      totalReferrerReward: obj.totalReferrerReward,
      currentEpochReferrerReward: obj.currentEpochReferrerReward,
    });
  }

  static toEncodable(fields: UserFeesFields) {
    return {
      totalFeePaid: fields.totalFeePaid,
      totalFeeRebate: fields.totalFeeRebate,
      totalTokenDiscount: fields.totalTokenDiscount,
      totalRefereeDiscount: fields.totalRefereeDiscount,
      totalReferrerReward: fields.totalReferrerReward,
      currentEpochReferrerReward: fields.currentEpochReferrerReward,
    };
  }

  toJSON(): UserFeesJSON {
    return {
      totalFeePaid: this.totalFeePaid.toString(),
      totalFeeRebate: this.totalFeeRebate.toString(),
      totalTokenDiscount: this.totalTokenDiscount.toString(),
      totalRefereeDiscount: this.totalRefereeDiscount.toString(),
      totalReferrerReward: this.totalReferrerReward.toString(),
      currentEpochReferrerReward: this.currentEpochReferrerReward.toString(),
    };
  }

  static fromJSON(obj: UserFeesJSON): UserFees {
    return new UserFees({
      totalFeePaid: new BN(obj.totalFeePaid),
      totalFeeRebate: new BN(obj.totalFeeRebate),
      totalTokenDiscount: new BN(obj.totalTokenDiscount),
      totalRefereeDiscount: new BN(obj.totalRefereeDiscount),
      totalReferrerReward: new BN(obj.totalReferrerReward),
      currentEpochReferrerReward: new BN(obj.currentEpochReferrerReward),
    });
  }

  toEncodable() {
    return UserFees.toEncodable(this);
  }
}
