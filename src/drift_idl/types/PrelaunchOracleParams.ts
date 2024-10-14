import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface PrelaunchOracleParamsFields {
  perpMarketIndex: number;
  price: BN | null;
  maxPrice: BN | null;
}

export interface PrelaunchOracleParamsJSON {
  perpMarketIndex: number;
  price: string | null;
  maxPrice: string | null;
}

export class PrelaunchOracleParams {
  readonly perpMarketIndex: number;
  readonly price: BN | null;
  readonly maxPrice: BN | null;

  constructor(fields: PrelaunchOracleParamsFields) {
    this.perpMarketIndex = fields.perpMarketIndex;
    this.price = fields.price;
    this.maxPrice = fields.maxPrice;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u16("perpMarketIndex"),
        borsh.option(borsh.i64(), "price"),
        borsh.option(borsh.i64(), "maxPrice"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new PrelaunchOracleParams({
      perpMarketIndex: obj.perpMarketIndex,
      price: obj.price,
      maxPrice: obj.maxPrice,
    });
  }

  static toEncodable(fields: PrelaunchOracleParamsFields) {
    return {
      perpMarketIndex: fields.perpMarketIndex,
      price: fields.price,
      maxPrice: fields.maxPrice,
    };
  }

  toJSON(): PrelaunchOracleParamsJSON {
    return {
      perpMarketIndex: this.perpMarketIndex,
      price: (this.price && this.price.toString()) || null,
      maxPrice: (this.maxPrice && this.maxPrice.toString()) || null,
    };
  }

  static fromJSON(obj: PrelaunchOracleParamsJSON): PrelaunchOracleParams {
    return new PrelaunchOracleParams({
      perpMarketIndex: obj.perpMarketIndex,
      price: (obj.price && new BN(obj.price)) || null,
      maxPrice: (obj.maxPrice && new BN(obj.maxPrice)) || null,
    });
  }

  toEncodable() {
    return PrelaunchOracleParams.toEncodable(this);
  }
}
