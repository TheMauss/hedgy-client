import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface OracleGuardRailsFields {
  priceDivergence: types.PriceDivergenceGuardRailsFields;
  validity: types.ValidityGuardRailsFields;
}

export interface OracleGuardRailsJSON {
  priceDivergence: types.PriceDivergenceGuardRailsJSON;
  validity: types.ValidityGuardRailsJSON;
}

export class OracleGuardRails {
  readonly priceDivergence: types.PriceDivergenceGuardRails;
  readonly validity: types.ValidityGuardRails;

  constructor(fields: OracleGuardRailsFields) {
    this.priceDivergence = new types.PriceDivergenceGuardRails({
      ...fields.priceDivergence,
    });
    this.validity = new types.ValidityGuardRails({ ...fields.validity });
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        types.PriceDivergenceGuardRails.layout("priceDivergence"),
        types.ValidityGuardRails.layout("validity"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new OracleGuardRails({
      priceDivergence: types.PriceDivergenceGuardRails.fromDecoded(
        obj.priceDivergence
      ),
      validity: types.ValidityGuardRails.fromDecoded(obj.validity),
    });
  }

  static toEncodable(fields: OracleGuardRailsFields) {
    return {
      priceDivergence: types.PriceDivergenceGuardRails.toEncodable(
        fields.priceDivergence
      ),
      validity: types.ValidityGuardRails.toEncodable(fields.validity),
    };
  }

  toJSON(): OracleGuardRailsJSON {
    return {
      priceDivergence: this.priceDivergence.toJSON(),
      validity: this.validity.toJSON(),
    };
  }

  static fromJSON(obj: OracleGuardRailsJSON): OracleGuardRails {
    return new OracleGuardRails({
      priceDivergence: types.PriceDivergenceGuardRails.fromJSON(
        obj.priceDivergence
      ),
      validity: types.ValidityGuardRails.fromJSON(obj.validity),
    });
  }

  toEncodable() {
    return OracleGuardRails.toEncodable(this);
  }
}
