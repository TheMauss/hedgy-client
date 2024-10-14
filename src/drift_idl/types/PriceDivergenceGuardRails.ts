import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface PriceDivergenceGuardRailsFields {
  markOraclePercentDivergence: BN;
  oracleTwap5minPercentDivergence: BN;
}

export interface PriceDivergenceGuardRailsJSON {
  markOraclePercentDivergence: string;
  oracleTwap5minPercentDivergence: string;
}

export class PriceDivergenceGuardRails {
  readonly markOraclePercentDivergence: BN;
  readonly oracleTwap5minPercentDivergence: BN;

  constructor(fields: PriceDivergenceGuardRailsFields) {
    this.markOraclePercentDivergence = fields.markOraclePercentDivergence;
    this.oracleTwap5minPercentDivergence =
      fields.oracleTwap5minPercentDivergence;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("markOraclePercentDivergence"),
        borsh.u64("oracleTwap5minPercentDivergence"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new PriceDivergenceGuardRails({
      markOraclePercentDivergence: obj.markOraclePercentDivergence,
      oracleTwap5minPercentDivergence: obj.oracleTwap5minPercentDivergence,
    });
  }

  static toEncodable(fields: PriceDivergenceGuardRailsFields) {
    return {
      markOraclePercentDivergence: fields.markOraclePercentDivergence,
      oracleTwap5minPercentDivergence: fields.oracleTwap5minPercentDivergence,
    };
  }

  toJSON(): PriceDivergenceGuardRailsJSON {
    return {
      markOraclePercentDivergence: this.markOraclePercentDivergence.toString(),
      oracleTwap5minPercentDivergence:
        this.oracleTwap5minPercentDivergence.toString(),
    };
  }

  static fromJSON(
    obj: PriceDivergenceGuardRailsJSON
  ): PriceDivergenceGuardRails {
    return new PriceDivergenceGuardRails({
      markOraclePercentDivergence: new BN(obj.markOraclePercentDivergence),
      oracleTwap5minPercentDivergence: new BN(
        obj.oracleTwap5minPercentDivergence
      ),
    });
  }

  toEncodable() {
    return PriceDivergenceGuardRails.toEncodable(this);
  }
}
