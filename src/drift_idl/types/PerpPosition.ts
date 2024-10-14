import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface PerpPositionFields {
  /**
   * The perp market's last cumulative funding rate. Used to calculate the funding payment owed to user
   * precision: FUNDING_RATE_PRECISION
   */
  lastCumulativeFundingRate: BN;
  /**
   * the size of the users perp position
   * precision: BASE_PRECISION
   */
  baseAssetAmount: BN;
  /**
   * Used to calculate the users pnl. Upon entry, is equal to base_asset_amount * avg entry price - fees
   * Updated when the user open/closes position or settles pnl. Includes fees/funding
   * precision: QUOTE_PRECISION
   */
  quoteAssetAmount: BN;
  /**
   * The amount of quote the user would need to exit their position at to break even
   * Updated when the user open/closes position or settles pnl. Includes fees/funding
   * precision: QUOTE_PRECISION
   */
  quoteBreakEvenAmount: BN;
  /**
   * The amount quote the user entered the position with. Equal to base asset amount * avg entry price
   * Updated when the user open/closes position. Excludes fees/funding
   * precision: QUOTE_PRECISION
   */
  quoteEntryAmount: BN;
  /**
   * The amount of open bids the user has in this perp market
   * precision: BASE_PRECISION
   */
  openBids: BN;
  /**
   * The amount of open asks the user has in this perp market
   * precision: BASE_PRECISION
   */
  openAsks: BN;
  /**
   * The amount of pnl settled in this market since opening the position
   * precision: QUOTE_PRECISION
   */
  settledPnl: BN;
  /**
   * The number of lp (liquidity provider) shares the user has in this perp market
   * LP shares allow users to provide liquidity via the AMM
   * precision: BASE_PRECISION
   */
  lpShares: BN;
  /**
   * The last base asset amount per lp the amm had
   * Used to settle the users lp position
   * precision: BASE_PRECISION
   */
  lastBaseAssetAmountPerLp: BN;
  /**
   * The last quote asset amount per lp the amm had
   * Used to settle the users lp position
   * precision: QUOTE_PRECISION
   */
  lastQuoteAssetAmountPerLp: BN;
  /**
   * Settling LP position can lead to a small amount of base asset being left over smaller than step size
   * This records that remainder so it can be settled later on
   * precision: BASE_PRECISION
   */
  remainderBaseAssetAmount: number;
  /** The market index for the perp market */
  marketIndex: number;
  /** The number of open orders */
  openOrders: number;
  perLpBase: number;
}

export interface PerpPositionJSON {
  /**
   * The perp market's last cumulative funding rate. Used to calculate the funding payment owed to user
   * precision: FUNDING_RATE_PRECISION
   */
  lastCumulativeFundingRate: string;
  /**
   * the size of the users perp position
   * precision: BASE_PRECISION
   */
  baseAssetAmount: string;
  /**
   * Used to calculate the users pnl. Upon entry, is equal to base_asset_amount * avg entry price - fees
   * Updated when the user open/closes position or settles pnl. Includes fees/funding
   * precision: QUOTE_PRECISION
   */
  quoteAssetAmount: string;
  /**
   * The amount of quote the user would need to exit their position at to break even
   * Updated when the user open/closes position or settles pnl. Includes fees/funding
   * precision: QUOTE_PRECISION
   */
  quoteBreakEvenAmount: string;
  /**
   * The amount quote the user entered the position with. Equal to base asset amount * avg entry price
   * Updated when the user open/closes position. Excludes fees/funding
   * precision: QUOTE_PRECISION
   */
  quoteEntryAmount: string;
  /**
   * The amount of open bids the user has in this perp market
   * precision: BASE_PRECISION
   */
  openBids: string;
  /**
   * The amount of open asks the user has in this perp market
   * precision: BASE_PRECISION
   */
  openAsks: string;
  /**
   * The amount of pnl settled in this market since opening the position
   * precision: QUOTE_PRECISION
   */
  settledPnl: string;
  /**
   * The number of lp (liquidity provider) shares the user has in this perp market
   * LP shares allow users to provide liquidity via the AMM
   * precision: BASE_PRECISION
   */
  lpShares: string;
  /**
   * The last base asset amount per lp the amm had
   * Used to settle the users lp position
   * precision: BASE_PRECISION
   */
  lastBaseAssetAmountPerLp: string;
  /**
   * The last quote asset amount per lp the amm had
   * Used to settle the users lp position
   * precision: QUOTE_PRECISION
   */
  lastQuoteAssetAmountPerLp: string;
  /**
   * Settling LP position can lead to a small amount of base asset being left over smaller than step size
   * This records that remainder so it can be settled later on
   * precision: BASE_PRECISION
   */
  remainderBaseAssetAmount: number;
  /** The market index for the perp market */
  marketIndex: number;
  /** The number of open orders */
  openOrders: number;
  perLpBase: number;
}

export class PerpPosition {
  /**
   * The perp market's last cumulative funding rate. Used to calculate the funding payment owed to user
   * precision: FUNDING_RATE_PRECISION
   */
  readonly lastCumulativeFundingRate: BN;
  /**
   * the size of the users perp position
   * precision: BASE_PRECISION
   */
  readonly baseAssetAmount: BN;
  /**
   * Used to calculate the users pnl. Upon entry, is equal to base_asset_amount * avg entry price - fees
   * Updated when the user open/closes position or settles pnl. Includes fees/funding
   * precision: QUOTE_PRECISION
   */
  readonly quoteAssetAmount: BN;
  /**
   * The amount of quote the user would need to exit their position at to break even
   * Updated when the user open/closes position or settles pnl. Includes fees/funding
   * precision: QUOTE_PRECISION
   */
  readonly quoteBreakEvenAmount: BN;
  /**
   * The amount quote the user entered the position with. Equal to base asset amount * avg entry price
   * Updated when the user open/closes position. Excludes fees/funding
   * precision: QUOTE_PRECISION
   */
  readonly quoteEntryAmount: BN;
  /**
   * The amount of open bids the user has in this perp market
   * precision: BASE_PRECISION
   */
  readonly openBids: BN;
  /**
   * The amount of open asks the user has in this perp market
   * precision: BASE_PRECISION
   */
  readonly openAsks: BN;
  /**
   * The amount of pnl settled in this market since opening the position
   * precision: QUOTE_PRECISION
   */
  readonly settledPnl: BN;
  /**
   * The number of lp (liquidity provider) shares the user has in this perp market
   * LP shares allow users to provide liquidity via the AMM
   * precision: BASE_PRECISION
   */
  readonly lpShares: BN;
  /**
   * The last base asset amount per lp the amm had
   * Used to settle the users lp position
   * precision: BASE_PRECISION
   */
  readonly lastBaseAssetAmountPerLp: BN;
  /**
   * The last quote asset amount per lp the amm had
   * Used to settle the users lp position
   * precision: QUOTE_PRECISION
   */
  readonly lastQuoteAssetAmountPerLp: BN;
  /**
   * Settling LP position can lead to a small amount of base asset being left over smaller than step size
   * This records that remainder so it can be settled later on
   * precision: BASE_PRECISION
   */
  readonly remainderBaseAssetAmount: number;
  /** The market index for the perp market */
  readonly marketIndex: number;
  /** The number of open orders */
  readonly openOrders: number;
  readonly perLpBase: number;

  constructor(fields: PerpPositionFields) {
    this.lastCumulativeFundingRate = fields.lastCumulativeFundingRate;
    this.baseAssetAmount = fields.baseAssetAmount;
    this.quoteAssetAmount = fields.quoteAssetAmount;
    this.quoteBreakEvenAmount = fields.quoteBreakEvenAmount;
    this.quoteEntryAmount = fields.quoteEntryAmount;
    this.openBids = fields.openBids;
    this.openAsks = fields.openAsks;
    this.settledPnl = fields.settledPnl;
    this.lpShares = fields.lpShares;
    this.lastBaseAssetAmountPerLp = fields.lastBaseAssetAmountPerLp;
    this.lastQuoteAssetAmountPerLp = fields.lastQuoteAssetAmountPerLp;
    this.remainderBaseAssetAmount = fields.remainderBaseAssetAmount;
    this.marketIndex = fields.marketIndex;
    this.openOrders = fields.openOrders;
    this.perLpBase = fields.perLpBase;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.i64("lastCumulativeFundingRate"),
        borsh.i64("baseAssetAmount"),
        borsh.i64("quoteAssetAmount"),
        borsh.i64("quoteBreakEvenAmount"),
        borsh.i64("quoteEntryAmount"),
        borsh.i64("openBids"),
        borsh.i64("openAsks"),
        borsh.i64("settledPnl"),
        borsh.u64("lpShares"),
        borsh.i64("lastBaseAssetAmountPerLp"),
        borsh.i64("lastQuoteAssetAmountPerLp"),
        borsh.i32("remainderBaseAssetAmount"),
        borsh.u16("marketIndex"),
        borsh.u8("openOrders"),
        borsh.i8("perLpBase"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new PerpPosition({
      lastCumulativeFundingRate: obj.lastCumulativeFundingRate,
      baseAssetAmount: obj.baseAssetAmount,
      quoteAssetAmount: obj.quoteAssetAmount,
      quoteBreakEvenAmount: obj.quoteBreakEvenAmount,
      quoteEntryAmount: obj.quoteEntryAmount,
      openBids: obj.openBids,
      openAsks: obj.openAsks,
      settledPnl: obj.settledPnl,
      lpShares: obj.lpShares,
      lastBaseAssetAmountPerLp: obj.lastBaseAssetAmountPerLp,
      lastQuoteAssetAmountPerLp: obj.lastQuoteAssetAmountPerLp,
      remainderBaseAssetAmount: obj.remainderBaseAssetAmount,
      marketIndex: obj.marketIndex,
      openOrders: obj.openOrders,
      perLpBase: obj.perLpBase,
    });
  }

  static toEncodable(fields: PerpPositionFields) {
    return {
      lastCumulativeFundingRate: fields.lastCumulativeFundingRate,
      baseAssetAmount: fields.baseAssetAmount,
      quoteAssetAmount: fields.quoteAssetAmount,
      quoteBreakEvenAmount: fields.quoteBreakEvenAmount,
      quoteEntryAmount: fields.quoteEntryAmount,
      openBids: fields.openBids,
      openAsks: fields.openAsks,
      settledPnl: fields.settledPnl,
      lpShares: fields.lpShares,
      lastBaseAssetAmountPerLp: fields.lastBaseAssetAmountPerLp,
      lastQuoteAssetAmountPerLp: fields.lastQuoteAssetAmountPerLp,
      remainderBaseAssetAmount: fields.remainderBaseAssetAmount,
      marketIndex: fields.marketIndex,
      openOrders: fields.openOrders,
      perLpBase: fields.perLpBase,
    };
  }

  toJSON(): PerpPositionJSON {
    return {
      lastCumulativeFundingRate: this.lastCumulativeFundingRate.toString(),
      baseAssetAmount: this.baseAssetAmount.toString(),
      quoteAssetAmount: this.quoteAssetAmount.toString(),
      quoteBreakEvenAmount: this.quoteBreakEvenAmount.toString(),
      quoteEntryAmount: this.quoteEntryAmount.toString(),
      openBids: this.openBids.toString(),
      openAsks: this.openAsks.toString(),
      settledPnl: this.settledPnl.toString(),
      lpShares: this.lpShares.toString(),
      lastBaseAssetAmountPerLp: this.lastBaseAssetAmountPerLp.toString(),
      lastQuoteAssetAmountPerLp: this.lastQuoteAssetAmountPerLp.toString(),
      remainderBaseAssetAmount: this.remainderBaseAssetAmount,
      marketIndex: this.marketIndex,
      openOrders: this.openOrders,
      perLpBase: this.perLpBase,
    };
  }

  static fromJSON(obj: PerpPositionJSON): PerpPosition {
    return new PerpPosition({
      lastCumulativeFundingRate: new BN(obj.lastCumulativeFundingRate),
      baseAssetAmount: new BN(obj.baseAssetAmount),
      quoteAssetAmount: new BN(obj.quoteAssetAmount),
      quoteBreakEvenAmount: new BN(obj.quoteBreakEvenAmount),
      quoteEntryAmount: new BN(obj.quoteEntryAmount),
      openBids: new BN(obj.openBids),
      openAsks: new BN(obj.openAsks),
      settledPnl: new BN(obj.settledPnl),
      lpShares: new BN(obj.lpShares),
      lastBaseAssetAmountPerLp: new BN(obj.lastBaseAssetAmountPerLp),
      lastQuoteAssetAmountPerLp: new BN(obj.lastQuoteAssetAmountPerLp),
      remainderBaseAssetAmount: obj.remainderBaseAssetAmount,
      marketIndex: obj.marketIndex,
      openOrders: obj.openOrders,
      perLpBase: obj.perLpBase,
    });
  }

  toEncodable() {
    return PerpPosition.toEncodable(this);
  }
}
