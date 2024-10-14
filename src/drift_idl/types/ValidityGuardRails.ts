import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface ValidityGuardRailsFields {
  slotsBeforeStaleForAmm: BN;
  slotsBeforeStaleForMargin: BN;
  confidenceIntervalMaxSize: BN;
  tooVolatileRatio: BN;
}

export interface ValidityGuardRailsJSON {
  slotsBeforeStaleForAmm: string;
  slotsBeforeStaleForMargin: string;
  confidenceIntervalMaxSize: string;
  tooVolatileRatio: string;
}

export class ValidityGuardRails {
  readonly slotsBeforeStaleForAmm: BN;
  readonly slotsBeforeStaleForMargin: BN;
  readonly confidenceIntervalMaxSize: BN;
  readonly tooVolatileRatio: BN;

  constructor(fields: ValidityGuardRailsFields) {
    this.slotsBeforeStaleForAmm = fields.slotsBeforeStaleForAmm;
    this.slotsBeforeStaleForMargin = fields.slotsBeforeStaleForMargin;
    this.confidenceIntervalMaxSize = fields.confidenceIntervalMaxSize;
    this.tooVolatileRatio = fields.tooVolatileRatio;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.i64("slotsBeforeStaleForAmm"),
        borsh.i64("slotsBeforeStaleForMargin"),
        borsh.u64("confidenceIntervalMaxSize"),
        borsh.i64("tooVolatileRatio"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new ValidityGuardRails({
      slotsBeforeStaleForAmm: obj.slotsBeforeStaleForAmm,
      slotsBeforeStaleForMargin: obj.slotsBeforeStaleForMargin,
      confidenceIntervalMaxSize: obj.confidenceIntervalMaxSize,
      tooVolatileRatio: obj.tooVolatileRatio,
    });
  }

  static toEncodable(fields: ValidityGuardRailsFields) {
    return {
      slotsBeforeStaleForAmm: fields.slotsBeforeStaleForAmm,
      slotsBeforeStaleForMargin: fields.slotsBeforeStaleForMargin,
      confidenceIntervalMaxSize: fields.confidenceIntervalMaxSize,
      tooVolatileRatio: fields.tooVolatileRatio,
    };
  }

  toJSON(): ValidityGuardRailsJSON {
    return {
      slotsBeforeStaleForAmm: this.slotsBeforeStaleForAmm.toString(),
      slotsBeforeStaleForMargin: this.slotsBeforeStaleForMargin.toString(),
      confidenceIntervalMaxSize: this.confidenceIntervalMaxSize.toString(),
      tooVolatileRatio: this.tooVolatileRatio.toString(),
    };
  }

  static fromJSON(obj: ValidityGuardRailsJSON): ValidityGuardRails {
    return new ValidityGuardRails({
      slotsBeforeStaleForAmm: new BN(obj.slotsBeforeStaleForAmm),
      slotsBeforeStaleForMargin: new BN(obj.slotsBeforeStaleForMargin),
      confidenceIntervalMaxSize: new BN(obj.confidenceIntervalMaxSize),
      tooVolatileRatio: new BN(obj.tooVolatileRatio),
    });
  }

  toEncodable() {
    return ValidityGuardRails.toEncodable(this);
  }
}
