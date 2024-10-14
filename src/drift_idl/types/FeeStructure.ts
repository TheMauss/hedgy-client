import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface FeeStructureFields {
  feeTiers: Array<types.FeeTierFields>;
  fillerRewardStructure: types.OrderFillerRewardStructureFields;
  referrerRewardEpochUpperBound: BN;
  flatFillerFee: BN;
}

export interface FeeStructureJSON {
  feeTiers: Array<types.FeeTierJSON>;
  fillerRewardStructure: types.OrderFillerRewardStructureJSON;
  referrerRewardEpochUpperBound: string;
  flatFillerFee: string;
}

export class FeeStructure {
  readonly feeTiers: Array<types.FeeTier>;
  readonly fillerRewardStructure: types.OrderFillerRewardStructure;
  readonly referrerRewardEpochUpperBound: BN;
  readonly flatFillerFee: BN;

  constructor(fields: FeeStructureFields) {
    this.feeTiers = fields.feeTiers.map(
      (item) => new types.FeeTier({ ...item })
    );
    this.fillerRewardStructure = new types.OrderFillerRewardStructure({
      ...fields.fillerRewardStructure,
    });
    this.referrerRewardEpochUpperBound = fields.referrerRewardEpochUpperBound;
    this.flatFillerFee = fields.flatFillerFee;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.array(types.FeeTier.layout(), 10, "feeTiers"),
        types.OrderFillerRewardStructure.layout("fillerRewardStructure"),
        borsh.u64("referrerRewardEpochUpperBound"),
        borsh.u64("flatFillerFee"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new FeeStructure({
      feeTiers: obj.feeTiers.map(
        (
          item: any /* eslint-disable-line @typescript-eslint/no-explicit-any */
        ) => types.FeeTier.fromDecoded(item)
      ),
      fillerRewardStructure: types.OrderFillerRewardStructure.fromDecoded(
        obj.fillerRewardStructure
      ),
      referrerRewardEpochUpperBound: obj.referrerRewardEpochUpperBound,
      flatFillerFee: obj.flatFillerFee,
    });
  }

  static toEncodable(fields: FeeStructureFields) {
    return {
      feeTiers: fields.feeTiers.map((item) => types.FeeTier.toEncodable(item)),
      fillerRewardStructure: types.OrderFillerRewardStructure.toEncodable(
        fields.fillerRewardStructure
      ),
      referrerRewardEpochUpperBound: fields.referrerRewardEpochUpperBound,
      flatFillerFee: fields.flatFillerFee,
    };
  }

  toJSON(): FeeStructureJSON {
    return {
      feeTiers: this.feeTiers.map((item) => item.toJSON()),
      fillerRewardStructure: this.fillerRewardStructure.toJSON(),
      referrerRewardEpochUpperBound:
        this.referrerRewardEpochUpperBound.toString(),
      flatFillerFee: this.flatFillerFee.toString(),
    };
  }

  static fromJSON(obj: FeeStructureJSON): FeeStructure {
    return new FeeStructure({
      feeTiers: obj.feeTiers.map((item) => types.FeeTier.fromJSON(item)),
      fillerRewardStructure: types.OrderFillerRewardStructure.fromJSON(
        obj.fillerRewardStructure
      ),
      referrerRewardEpochUpperBound: new BN(obj.referrerRewardEpochUpperBound),
      flatFillerFee: new BN(obj.flatFillerFee),
    });
  }

  toEncodable() {
    return FeeStructure.toEncodable(this);
  }
}
