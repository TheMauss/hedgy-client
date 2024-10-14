import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface MarketIdentifierFields {
  marketType: types.MarketTypeKind;
  marketIndex: number;
}

export interface MarketIdentifierJSON {
  marketType: types.MarketTypeJSON;
  marketIndex: number;
}

export class MarketIdentifier {
  readonly marketType: types.MarketTypeKind;
  readonly marketIndex: number;

  constructor(fields: MarketIdentifierFields) {
    this.marketType = fields.marketType;
    this.marketIndex = fields.marketIndex;
  }

  static layout(property?: string) {
    return borsh.struct(
      [types.MarketType.layout("marketType"), borsh.u16("marketIndex")],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new MarketIdentifier({
      marketType: types.MarketType.fromDecoded(obj.marketType),
      marketIndex: obj.marketIndex,
    });
  }

  static toEncodable(fields: MarketIdentifierFields) {
    return {
      marketType: fields.marketType.toEncodable(),
      marketIndex: fields.marketIndex,
    };
  }

  toJSON(): MarketIdentifierJSON {
    return {
      marketType: this.marketType.toJSON(),
      marketIndex: this.marketIndex,
    };
  }

  static fromJSON(obj: MarketIdentifierJSON): MarketIdentifier {
    return new MarketIdentifier({
      marketType: types.MarketType.fromJSON(obj.marketType),
      marketIndex: obj.marketIndex,
    });
  }

  toEncodable() {
    return MarketIdentifier.toEncodable(this);
  }
}
