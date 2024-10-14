import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface HistoricalIndexDataFields {
  /** precision: PRICE_PRECISION */
  lastIndexBidPrice: BN;
  /** precision: PRICE_PRECISION */
  lastIndexAskPrice: BN;
  /** precision: PRICE_PRECISION */
  lastIndexPriceTwap: BN;
  /** precision: PRICE_PRECISION */
  lastIndexPriceTwap5min: BN;
  /** unix_timestamp of last snapshot */
  lastIndexPriceTwapTs: BN;
}

export interface HistoricalIndexDataJSON {
  /** precision: PRICE_PRECISION */
  lastIndexBidPrice: string;
  /** precision: PRICE_PRECISION */
  lastIndexAskPrice: string;
  /** precision: PRICE_PRECISION */
  lastIndexPriceTwap: string;
  /** precision: PRICE_PRECISION */
  lastIndexPriceTwap5min: string;
  /** unix_timestamp of last snapshot */
  lastIndexPriceTwapTs: string;
}

export class HistoricalIndexData {
  /** precision: PRICE_PRECISION */
  readonly lastIndexBidPrice: BN;
  /** precision: PRICE_PRECISION */
  readonly lastIndexAskPrice: BN;
  /** precision: PRICE_PRECISION */
  readonly lastIndexPriceTwap: BN;
  /** precision: PRICE_PRECISION */
  readonly lastIndexPriceTwap5min: BN;
  /** unix_timestamp of last snapshot */
  readonly lastIndexPriceTwapTs: BN;

  constructor(fields: HistoricalIndexDataFields) {
    this.lastIndexBidPrice = fields.lastIndexBidPrice;
    this.lastIndexAskPrice = fields.lastIndexAskPrice;
    this.lastIndexPriceTwap = fields.lastIndexPriceTwap;
    this.lastIndexPriceTwap5min = fields.lastIndexPriceTwap5min;
    this.lastIndexPriceTwapTs = fields.lastIndexPriceTwapTs;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("lastIndexBidPrice"),
        borsh.u64("lastIndexAskPrice"),
        borsh.u64("lastIndexPriceTwap"),
        borsh.u64("lastIndexPriceTwap5min"),
        borsh.i64("lastIndexPriceTwapTs"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new HistoricalIndexData({
      lastIndexBidPrice: obj.lastIndexBidPrice,
      lastIndexAskPrice: obj.lastIndexAskPrice,
      lastIndexPriceTwap: obj.lastIndexPriceTwap,
      lastIndexPriceTwap5min: obj.lastIndexPriceTwap5min,
      lastIndexPriceTwapTs: obj.lastIndexPriceTwapTs,
    });
  }

  static toEncodable(fields: HistoricalIndexDataFields) {
    return {
      lastIndexBidPrice: fields.lastIndexBidPrice,
      lastIndexAskPrice: fields.lastIndexAskPrice,
      lastIndexPriceTwap: fields.lastIndexPriceTwap,
      lastIndexPriceTwap5min: fields.lastIndexPriceTwap5min,
      lastIndexPriceTwapTs: fields.lastIndexPriceTwapTs,
    };
  }

  toJSON(): HistoricalIndexDataJSON {
    return {
      lastIndexBidPrice: this.lastIndexBidPrice.toString(),
      lastIndexAskPrice: this.lastIndexAskPrice.toString(),
      lastIndexPriceTwap: this.lastIndexPriceTwap.toString(),
      lastIndexPriceTwap5min: this.lastIndexPriceTwap5min.toString(),
      lastIndexPriceTwapTs: this.lastIndexPriceTwapTs.toString(),
    };
  }

  static fromJSON(obj: HistoricalIndexDataJSON): HistoricalIndexData {
    return new HistoricalIndexData({
      lastIndexBidPrice: new BN(obj.lastIndexBidPrice),
      lastIndexAskPrice: new BN(obj.lastIndexAskPrice),
      lastIndexPriceTwap: new BN(obj.lastIndexPriceTwap),
      lastIndexPriceTwap5min: new BN(obj.lastIndexPriceTwap5min),
      lastIndexPriceTwapTs: new BN(obj.lastIndexPriceTwapTs),
    });
  }

  toEncodable() {
    return HistoricalIndexData.toEncodable(this);
  }
}
