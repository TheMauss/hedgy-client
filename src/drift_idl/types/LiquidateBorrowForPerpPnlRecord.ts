import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface LiquidateBorrowForPerpPnlRecordFields {
  perpMarketIndex: number;
  marketOraclePrice: BN;
  pnlTransfer: BN;
  liabilityMarketIndex: number;
  liabilityPrice: BN;
  liabilityTransfer: BN;
}

export interface LiquidateBorrowForPerpPnlRecordJSON {
  perpMarketIndex: number;
  marketOraclePrice: string;
  pnlTransfer: string;
  liabilityMarketIndex: number;
  liabilityPrice: string;
  liabilityTransfer: string;
}

export class LiquidateBorrowForPerpPnlRecord {
  readonly perpMarketIndex: number;
  readonly marketOraclePrice: BN;
  readonly pnlTransfer: BN;
  readonly liabilityMarketIndex: number;
  readonly liabilityPrice: BN;
  readonly liabilityTransfer: BN;

  constructor(fields: LiquidateBorrowForPerpPnlRecordFields) {
    this.perpMarketIndex = fields.perpMarketIndex;
    this.marketOraclePrice = fields.marketOraclePrice;
    this.pnlTransfer = fields.pnlTransfer;
    this.liabilityMarketIndex = fields.liabilityMarketIndex;
    this.liabilityPrice = fields.liabilityPrice;
    this.liabilityTransfer = fields.liabilityTransfer;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u16("perpMarketIndex"),
        borsh.i64("marketOraclePrice"),
        borsh.u128("pnlTransfer"),
        borsh.u16("liabilityMarketIndex"),
        borsh.i64("liabilityPrice"),
        borsh.u128("liabilityTransfer"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new LiquidateBorrowForPerpPnlRecord({
      perpMarketIndex: obj.perpMarketIndex,
      marketOraclePrice: obj.marketOraclePrice,
      pnlTransfer: obj.pnlTransfer,
      liabilityMarketIndex: obj.liabilityMarketIndex,
      liabilityPrice: obj.liabilityPrice,
      liabilityTransfer: obj.liabilityTransfer,
    });
  }

  static toEncodable(fields: LiquidateBorrowForPerpPnlRecordFields) {
    return {
      perpMarketIndex: fields.perpMarketIndex,
      marketOraclePrice: fields.marketOraclePrice,
      pnlTransfer: fields.pnlTransfer,
      liabilityMarketIndex: fields.liabilityMarketIndex,
      liabilityPrice: fields.liabilityPrice,
      liabilityTransfer: fields.liabilityTransfer,
    };
  }

  toJSON(): LiquidateBorrowForPerpPnlRecordJSON {
    return {
      perpMarketIndex: this.perpMarketIndex,
      marketOraclePrice: this.marketOraclePrice.toString(),
      pnlTransfer: this.pnlTransfer.toString(),
      liabilityMarketIndex: this.liabilityMarketIndex,
      liabilityPrice: this.liabilityPrice.toString(),
      liabilityTransfer: this.liabilityTransfer.toString(),
    };
  }

  static fromJSON(
    obj: LiquidateBorrowForPerpPnlRecordJSON
  ): LiquidateBorrowForPerpPnlRecord {
    return new LiquidateBorrowForPerpPnlRecord({
      perpMarketIndex: obj.perpMarketIndex,
      marketOraclePrice: new BN(obj.marketOraclePrice),
      pnlTransfer: new BN(obj.pnlTransfer),
      liabilityMarketIndex: obj.liabilityMarketIndex,
      liabilityPrice: new BN(obj.liabilityPrice),
      liabilityTransfer: new BN(obj.liabilityTransfer),
    });
  }

  toEncodable() {
    return LiquidateBorrowForPerpPnlRecord.toEncodable(this);
  }
}
