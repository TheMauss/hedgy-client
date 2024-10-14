import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface LiquidateSpotRecordFields {
  assetMarketIndex: number;
  assetPrice: BN;
  assetTransfer: BN;
  liabilityMarketIndex: number;
  liabilityPrice: BN;
  /** precision: token mint precision */
  liabilityTransfer: BN;
  /** precision: token mint precision */
  ifFee: BN;
}

export interface LiquidateSpotRecordJSON {
  assetMarketIndex: number;
  assetPrice: string;
  assetTransfer: string;
  liabilityMarketIndex: number;
  liabilityPrice: string;
  /** precision: token mint precision */
  liabilityTransfer: string;
  /** precision: token mint precision */
  ifFee: string;
}

export class LiquidateSpotRecord {
  readonly assetMarketIndex: number;
  readonly assetPrice: BN;
  readonly assetTransfer: BN;
  readonly liabilityMarketIndex: number;
  readonly liabilityPrice: BN;
  /** precision: token mint precision */
  readonly liabilityTransfer: BN;
  /** precision: token mint precision */
  readonly ifFee: BN;

  constructor(fields: LiquidateSpotRecordFields) {
    this.assetMarketIndex = fields.assetMarketIndex;
    this.assetPrice = fields.assetPrice;
    this.assetTransfer = fields.assetTransfer;
    this.liabilityMarketIndex = fields.liabilityMarketIndex;
    this.liabilityPrice = fields.liabilityPrice;
    this.liabilityTransfer = fields.liabilityTransfer;
    this.ifFee = fields.ifFee;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u16("assetMarketIndex"),
        borsh.i64("assetPrice"),
        borsh.u128("assetTransfer"),
        borsh.u16("liabilityMarketIndex"),
        borsh.i64("liabilityPrice"),
        borsh.u128("liabilityTransfer"),
        borsh.u64("ifFee"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new LiquidateSpotRecord({
      assetMarketIndex: obj.assetMarketIndex,
      assetPrice: obj.assetPrice,
      assetTransfer: obj.assetTransfer,
      liabilityMarketIndex: obj.liabilityMarketIndex,
      liabilityPrice: obj.liabilityPrice,
      liabilityTransfer: obj.liabilityTransfer,
      ifFee: obj.ifFee,
    });
  }

  static toEncodable(fields: LiquidateSpotRecordFields) {
    return {
      assetMarketIndex: fields.assetMarketIndex,
      assetPrice: fields.assetPrice,
      assetTransfer: fields.assetTransfer,
      liabilityMarketIndex: fields.liabilityMarketIndex,
      liabilityPrice: fields.liabilityPrice,
      liabilityTransfer: fields.liabilityTransfer,
      ifFee: fields.ifFee,
    };
  }

  toJSON(): LiquidateSpotRecordJSON {
    return {
      assetMarketIndex: this.assetMarketIndex,
      assetPrice: this.assetPrice.toString(),
      assetTransfer: this.assetTransfer.toString(),
      liabilityMarketIndex: this.liabilityMarketIndex,
      liabilityPrice: this.liabilityPrice.toString(),
      liabilityTransfer: this.liabilityTransfer.toString(),
      ifFee: this.ifFee.toString(),
    };
  }

  static fromJSON(obj: LiquidateSpotRecordJSON): LiquidateSpotRecord {
    return new LiquidateSpotRecord({
      assetMarketIndex: obj.assetMarketIndex,
      assetPrice: new BN(obj.assetPrice),
      assetTransfer: new BN(obj.assetTransfer),
      liabilityMarketIndex: obj.liabilityMarketIndex,
      liabilityPrice: new BN(obj.liabilityPrice),
      liabilityTransfer: new BN(obj.liabilityTransfer),
      ifFee: new BN(obj.ifFee),
    });
  }

  toEncodable() {
    return LiquidateSpotRecord.toEncodable(this);
  }
}
