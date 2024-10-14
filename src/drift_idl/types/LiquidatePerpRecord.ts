import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface LiquidatePerpRecordFields {
  marketIndex: number;
  oraclePrice: BN;
  baseAssetAmount: BN;
  quoteAssetAmount: BN;
  /** precision: AMM_RESERVE_PRECISION */
  lpShares: BN;
  fillRecordId: BN;
  userOrderId: number;
  liquidatorOrderId: number;
  /** precision: QUOTE_PRECISION */
  liquidatorFee: BN;
  /** precision: QUOTE_PRECISION */
  ifFee: BN;
}

export interface LiquidatePerpRecordJSON {
  marketIndex: number;
  oraclePrice: string;
  baseAssetAmount: string;
  quoteAssetAmount: string;
  /** precision: AMM_RESERVE_PRECISION */
  lpShares: string;
  fillRecordId: string;
  userOrderId: number;
  liquidatorOrderId: number;
  /** precision: QUOTE_PRECISION */
  liquidatorFee: string;
  /** precision: QUOTE_PRECISION */
  ifFee: string;
}

export class LiquidatePerpRecord {
  readonly marketIndex: number;
  readonly oraclePrice: BN;
  readonly baseAssetAmount: BN;
  readonly quoteAssetAmount: BN;
  /** precision: AMM_RESERVE_PRECISION */
  readonly lpShares: BN;
  readonly fillRecordId: BN;
  readonly userOrderId: number;
  readonly liquidatorOrderId: number;
  /** precision: QUOTE_PRECISION */
  readonly liquidatorFee: BN;
  /** precision: QUOTE_PRECISION */
  readonly ifFee: BN;

  constructor(fields: LiquidatePerpRecordFields) {
    this.marketIndex = fields.marketIndex;
    this.oraclePrice = fields.oraclePrice;
    this.baseAssetAmount = fields.baseAssetAmount;
    this.quoteAssetAmount = fields.quoteAssetAmount;
    this.lpShares = fields.lpShares;
    this.fillRecordId = fields.fillRecordId;
    this.userOrderId = fields.userOrderId;
    this.liquidatorOrderId = fields.liquidatorOrderId;
    this.liquidatorFee = fields.liquidatorFee;
    this.ifFee = fields.ifFee;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u16("marketIndex"),
        borsh.i64("oraclePrice"),
        borsh.i64("baseAssetAmount"),
        borsh.i64("quoteAssetAmount"),
        borsh.u64("lpShares"),
        borsh.u64("fillRecordId"),
        borsh.u32("userOrderId"),
        borsh.u32("liquidatorOrderId"),
        borsh.u64("liquidatorFee"),
        borsh.u64("ifFee"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new LiquidatePerpRecord({
      marketIndex: obj.marketIndex,
      oraclePrice: obj.oraclePrice,
      baseAssetAmount: obj.baseAssetAmount,
      quoteAssetAmount: obj.quoteAssetAmount,
      lpShares: obj.lpShares,
      fillRecordId: obj.fillRecordId,
      userOrderId: obj.userOrderId,
      liquidatorOrderId: obj.liquidatorOrderId,
      liquidatorFee: obj.liquidatorFee,
      ifFee: obj.ifFee,
    });
  }

  static toEncodable(fields: LiquidatePerpRecordFields) {
    return {
      marketIndex: fields.marketIndex,
      oraclePrice: fields.oraclePrice,
      baseAssetAmount: fields.baseAssetAmount,
      quoteAssetAmount: fields.quoteAssetAmount,
      lpShares: fields.lpShares,
      fillRecordId: fields.fillRecordId,
      userOrderId: fields.userOrderId,
      liquidatorOrderId: fields.liquidatorOrderId,
      liquidatorFee: fields.liquidatorFee,
      ifFee: fields.ifFee,
    };
  }

  toJSON(): LiquidatePerpRecordJSON {
    return {
      marketIndex: this.marketIndex,
      oraclePrice: this.oraclePrice.toString(),
      baseAssetAmount: this.baseAssetAmount.toString(),
      quoteAssetAmount: this.quoteAssetAmount.toString(),
      lpShares: this.lpShares.toString(),
      fillRecordId: this.fillRecordId.toString(),
      userOrderId: this.userOrderId,
      liquidatorOrderId: this.liquidatorOrderId,
      liquidatorFee: this.liquidatorFee.toString(),
      ifFee: this.ifFee.toString(),
    };
  }

  static fromJSON(obj: LiquidatePerpRecordJSON): LiquidatePerpRecord {
    return new LiquidatePerpRecord({
      marketIndex: obj.marketIndex,
      oraclePrice: new BN(obj.oraclePrice),
      baseAssetAmount: new BN(obj.baseAssetAmount),
      quoteAssetAmount: new BN(obj.quoteAssetAmount),
      lpShares: new BN(obj.lpShares),
      fillRecordId: new BN(obj.fillRecordId),
      userOrderId: obj.userOrderId,
      liquidatorOrderId: obj.liquidatorOrderId,
      liquidatorFee: new BN(obj.liquidatorFee),
      ifFee: new BN(obj.ifFee),
    });
  }

  toEncodable() {
    return LiquidatePerpRecord.toEncodable(this);
  }
}
