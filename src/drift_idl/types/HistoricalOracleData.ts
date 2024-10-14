import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface HistoricalOracleDataFields {
  /** precision: PRICE_PRECISION */
  lastOraclePrice: BN;
  /** precision: PRICE_PRECISION */
  lastOracleConf: BN;
  /** number of slots since last update */
  lastOracleDelay: BN;
  /** precision: PRICE_PRECISION */
  lastOraclePriceTwap: BN;
  /** precision: PRICE_PRECISION */
  lastOraclePriceTwap5min: BN;
  /** unix_timestamp of last snapshot */
  lastOraclePriceTwapTs: BN;
}

export interface HistoricalOracleDataJSON {
  /** precision: PRICE_PRECISION */
  lastOraclePrice: string;
  /** precision: PRICE_PRECISION */
  lastOracleConf: string;
  /** number of slots since last update */
  lastOracleDelay: string;
  /** precision: PRICE_PRECISION */
  lastOraclePriceTwap: string;
  /** precision: PRICE_PRECISION */
  lastOraclePriceTwap5min: string;
  /** unix_timestamp of last snapshot */
  lastOraclePriceTwapTs: string;
}

export class HistoricalOracleData {
  /** precision: PRICE_PRECISION */
  readonly lastOraclePrice: BN;
  /** precision: PRICE_PRECISION */
  readonly lastOracleConf: BN;
  /** number of slots since last update */
  readonly lastOracleDelay: BN;
  /** precision: PRICE_PRECISION */
  readonly lastOraclePriceTwap: BN;
  /** precision: PRICE_PRECISION */
  readonly lastOraclePriceTwap5min: BN;
  /** unix_timestamp of last snapshot */
  readonly lastOraclePriceTwapTs: BN;

  constructor(fields: HistoricalOracleDataFields) {
    this.lastOraclePrice = fields.lastOraclePrice;
    this.lastOracleConf = fields.lastOracleConf;
    this.lastOracleDelay = fields.lastOracleDelay;
    this.lastOraclePriceTwap = fields.lastOraclePriceTwap;
    this.lastOraclePriceTwap5min = fields.lastOraclePriceTwap5min;
    this.lastOraclePriceTwapTs = fields.lastOraclePriceTwapTs;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.i64("lastOraclePrice"),
        borsh.u64("lastOracleConf"),
        borsh.i64("lastOracleDelay"),
        borsh.i64("lastOraclePriceTwap"),
        borsh.i64("lastOraclePriceTwap5min"),
        borsh.i64("lastOraclePriceTwapTs"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new HistoricalOracleData({
      lastOraclePrice: obj.lastOraclePrice,
      lastOracleConf: obj.lastOracleConf,
      lastOracleDelay: obj.lastOracleDelay,
      lastOraclePriceTwap: obj.lastOraclePriceTwap,
      lastOraclePriceTwap5min: obj.lastOraclePriceTwap5min,
      lastOraclePriceTwapTs: obj.lastOraclePriceTwapTs,
    });
  }

  static toEncodable(fields: HistoricalOracleDataFields) {
    return {
      lastOraclePrice: fields.lastOraclePrice,
      lastOracleConf: fields.lastOracleConf,
      lastOracleDelay: fields.lastOracleDelay,
      lastOraclePriceTwap: fields.lastOraclePriceTwap,
      lastOraclePriceTwap5min: fields.lastOraclePriceTwap5min,
      lastOraclePriceTwapTs: fields.lastOraclePriceTwapTs,
    };
  }

  toJSON(): HistoricalOracleDataJSON {
    return {
      lastOraclePrice: this.lastOraclePrice.toString(),
      lastOracleConf: this.lastOracleConf.toString(),
      lastOracleDelay: this.lastOracleDelay.toString(),
      lastOraclePriceTwap: this.lastOraclePriceTwap.toString(),
      lastOraclePriceTwap5min: this.lastOraclePriceTwap5min.toString(),
      lastOraclePriceTwapTs: this.lastOraclePriceTwapTs.toString(),
    };
  }

  static fromJSON(obj: HistoricalOracleDataJSON): HistoricalOracleData {
    return new HistoricalOracleData({
      lastOraclePrice: new BN(obj.lastOraclePrice),
      lastOracleConf: new BN(obj.lastOracleConf),
      lastOracleDelay: new BN(obj.lastOracleDelay),
      lastOraclePriceTwap: new BN(obj.lastOraclePriceTwap),
      lastOraclePriceTwap5min: new BN(obj.lastOraclePriceTwap5min),
      lastOraclePriceTwapTs: new BN(obj.lastOraclePriceTwapTs),
    });
  }

  toEncodable() {
    return HistoricalOracleData.toEncodable(this);
  }
}
