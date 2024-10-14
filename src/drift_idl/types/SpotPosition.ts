import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface SpotPositionFields {
  /**
   * The scaled balance of the position. To get the token amount, multiply by the cumulative deposit/borrow
   * interest of corresponding market.
   * precision: SPOT_BALANCE_PRECISION
   */
  scaledBalance: BN;
  /**
   * How many spot bids the user has open
   * precision: token mint precision
   */
  openBids: BN;
  /**
   * How many spot asks the user has open
   * precision: token mint precision
   */
  openAsks: BN;
  /**
   * The cumulative deposits/borrows a user has made into a market
   * precision: token mint precision
   */
  cumulativeDeposits: BN;
  /** The market index of the corresponding spot market */
  marketIndex: number;
  /** Whether the position is deposit or borrow */
  balanceType: types.SpotBalanceTypeKind;
  /** Number of open orders */
  openOrders: number;
  padding: Array<number>;
}

export interface SpotPositionJSON {
  /**
   * The scaled balance of the position. To get the token amount, multiply by the cumulative deposit/borrow
   * interest of corresponding market.
   * precision: SPOT_BALANCE_PRECISION
   */
  scaledBalance: string;
  /**
   * How many spot bids the user has open
   * precision: token mint precision
   */
  openBids: string;
  /**
   * How many spot asks the user has open
   * precision: token mint precision
   */
  openAsks: string;
  /**
   * The cumulative deposits/borrows a user has made into a market
   * precision: token mint precision
   */
  cumulativeDeposits: string;
  /** The market index of the corresponding spot market */
  marketIndex: number;
  /** Whether the position is deposit or borrow */
  balanceType: types.SpotBalanceTypeJSON;
  /** Number of open orders */
  openOrders: number;
  padding: Array<number>;
}

export class SpotPosition {
  /**
   * The scaled balance of the position. To get the token amount, multiply by the cumulative deposit/borrow
   * interest of corresponding market.
   * precision: SPOT_BALANCE_PRECISION
   */
  readonly scaledBalance: BN;
  /**
   * How many spot bids the user has open
   * precision: token mint precision
   */
  readonly openBids: BN;
  /**
   * How many spot asks the user has open
   * precision: token mint precision
   */
  readonly openAsks: BN;
  /**
   * The cumulative deposits/borrows a user has made into a market
   * precision: token mint precision
   */
  readonly cumulativeDeposits: BN;
  /** The market index of the corresponding spot market */
  readonly marketIndex: number;
  /** Whether the position is deposit or borrow */
  readonly balanceType: types.SpotBalanceTypeKind;
  /** Number of open orders */
  readonly openOrders: number;
  readonly padding: Array<number>;

  constructor(fields: SpotPositionFields) {
    this.scaledBalance = fields.scaledBalance;
    this.openBids = fields.openBids;
    this.openAsks = fields.openAsks;
    this.cumulativeDeposits = fields.cumulativeDeposits;
    this.marketIndex = fields.marketIndex;
    this.balanceType = fields.balanceType;
    this.openOrders = fields.openOrders;
    this.padding = fields.padding;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("scaledBalance"),
        borsh.i64("openBids"),
        borsh.i64("openAsks"),
        borsh.i64("cumulativeDeposits"),
        borsh.u16("marketIndex"),
        types.SpotBalanceType.layout("balanceType"),
        borsh.u8("openOrders"),
        borsh.array(borsh.u8(), 4, "padding"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new SpotPosition({
      scaledBalance: obj.scaledBalance,
      openBids: obj.openBids,
      openAsks: obj.openAsks,
      cumulativeDeposits: obj.cumulativeDeposits,
      marketIndex: obj.marketIndex,
      balanceType: types.SpotBalanceType.fromDecoded(obj.balanceType),
      openOrders: obj.openOrders,
      padding: obj.padding,
    });
  }

  static toEncodable(fields: SpotPositionFields) {
    return {
      scaledBalance: fields.scaledBalance,
      openBids: fields.openBids,
      openAsks: fields.openAsks,
      cumulativeDeposits: fields.cumulativeDeposits,
      marketIndex: fields.marketIndex,
      balanceType: fields.balanceType.toEncodable(),
      openOrders: fields.openOrders,
      padding: fields.padding,
    };
  }

  toJSON(): SpotPositionJSON {
    return {
      scaledBalance: this.scaledBalance.toString(),
      openBids: this.openBids.toString(),
      openAsks: this.openAsks.toString(),
      cumulativeDeposits: this.cumulativeDeposits.toString(),
      marketIndex: this.marketIndex,
      balanceType: this.balanceType.toJSON(),
      openOrders: this.openOrders,
      padding: this.padding,
    };
  }

  static fromJSON(obj: SpotPositionJSON): SpotPosition {
    return new SpotPosition({
      scaledBalance: new BN(obj.scaledBalance),
      openBids: new BN(obj.openBids),
      openAsks: new BN(obj.openAsks),
      cumulativeDeposits: new BN(obj.cumulativeDeposits),
      marketIndex: obj.marketIndex,
      balanceType: types.SpotBalanceType.fromJSON(obj.balanceType),
      openOrders: obj.openOrders,
      padding: obj.padding,
    });
  }

  toEncodable() {
    return SpotPosition.toEncodable(this);
  }
}
