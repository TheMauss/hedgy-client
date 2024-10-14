import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface LiquidatePerpPnlForDepositRecordFields {
  perpMarketIndex: number;
  marketOraclePrice: BN;
  pnlTransfer: BN;
  assetMarketIndex: number;
  assetPrice: BN;
  assetTransfer: BN;
}

export interface LiquidatePerpPnlForDepositRecordJSON {
  perpMarketIndex: number;
  marketOraclePrice: string;
  pnlTransfer: string;
  assetMarketIndex: number;
  assetPrice: string;
  assetTransfer: string;
}

export class LiquidatePerpPnlForDepositRecord {
  readonly perpMarketIndex: number;
  readonly marketOraclePrice: BN;
  readonly pnlTransfer: BN;
  readonly assetMarketIndex: number;
  readonly assetPrice: BN;
  readonly assetTransfer: BN;

  constructor(fields: LiquidatePerpPnlForDepositRecordFields) {
    this.perpMarketIndex = fields.perpMarketIndex;
    this.marketOraclePrice = fields.marketOraclePrice;
    this.pnlTransfer = fields.pnlTransfer;
    this.assetMarketIndex = fields.assetMarketIndex;
    this.assetPrice = fields.assetPrice;
    this.assetTransfer = fields.assetTransfer;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u16("perpMarketIndex"),
        borsh.i64("marketOraclePrice"),
        borsh.u128("pnlTransfer"),
        borsh.u16("assetMarketIndex"),
        borsh.i64("assetPrice"),
        borsh.u128("assetTransfer"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new LiquidatePerpPnlForDepositRecord({
      perpMarketIndex: obj.perpMarketIndex,
      marketOraclePrice: obj.marketOraclePrice,
      pnlTransfer: obj.pnlTransfer,
      assetMarketIndex: obj.assetMarketIndex,
      assetPrice: obj.assetPrice,
      assetTransfer: obj.assetTransfer,
    });
  }

  static toEncodable(fields: LiquidatePerpPnlForDepositRecordFields) {
    return {
      perpMarketIndex: fields.perpMarketIndex,
      marketOraclePrice: fields.marketOraclePrice,
      pnlTransfer: fields.pnlTransfer,
      assetMarketIndex: fields.assetMarketIndex,
      assetPrice: fields.assetPrice,
      assetTransfer: fields.assetTransfer,
    };
  }

  toJSON(): LiquidatePerpPnlForDepositRecordJSON {
    return {
      perpMarketIndex: this.perpMarketIndex,
      marketOraclePrice: this.marketOraclePrice.toString(),
      pnlTransfer: this.pnlTransfer.toString(),
      assetMarketIndex: this.assetMarketIndex,
      assetPrice: this.assetPrice.toString(),
      assetTransfer: this.assetTransfer.toString(),
    };
  }

  static fromJSON(
    obj: LiquidatePerpPnlForDepositRecordJSON
  ): LiquidatePerpPnlForDepositRecord {
    return new LiquidatePerpPnlForDepositRecord({
      perpMarketIndex: obj.perpMarketIndex,
      marketOraclePrice: new BN(obj.marketOraclePrice),
      pnlTransfer: new BN(obj.pnlTransfer),
      assetMarketIndex: obj.assetMarketIndex,
      assetPrice: new BN(obj.assetPrice),
      assetTransfer: new BN(obj.assetTransfer),
    });
  }

  toEncodable() {
    return LiquidatePerpPnlForDepositRecord.toEncodable(this);
  }
}
