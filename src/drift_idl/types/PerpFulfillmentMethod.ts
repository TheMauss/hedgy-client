import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export type AMMFields = [BN | null];
export type AMMValue = [BN | null];

export interface AMMJSON {
  kind: "AMM";
  value: [string | null];
}

export class AMM {
  static readonly discriminator = 0;
  static readonly kind = "AMM";
  readonly discriminator = 0;
  readonly kind = "AMM";
  readonly value: AMMValue;

  constructor(value: AMMFields) {
    this.value = [value[0]];
  }

  toJSON(): AMMJSON {
    return {
      kind: "AMM",
      value: [(this.value[0] && this.value[0].toString()) || null],
    };
  }

  toEncodable() {
    return {
      AMM: {
        _0: this.value[0],
      },
    };
  }
}

export type MatchFields = [PublicKey, number];
export type MatchValue = [PublicKey, number];

export interface MatchJSON {
  kind: "Match";
  value: [string, number];
}

export class Match {
  static readonly discriminator = 1;
  static readonly kind = "Match";
  readonly discriminator = 1;
  readonly kind = "Match";
  readonly value: MatchValue;

  constructor(value: MatchFields) {
    this.value = [value[0], value[1]];
  }

  toJSON(): MatchJSON {
    return {
      kind: "Match",
      value: [this.value[0].toString(), this.value[1]],
    };
  }

  toEncodable() {
    return {
      Match: {
        _0: this.value[0],
        _1: this.value[1],
      },
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.PerpFulfillmentMethodKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("AMM" in obj) {
    const val = obj["AMM"];
    return new AMM([val["_0"]]);
  }
  if ("Match" in obj) {
    const val = obj["Match"];
    return new Match([val["_0"], val["_1"]]);
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.PerpFulfillmentMethodJSON
): types.PerpFulfillmentMethodKind {
  switch (obj.kind) {
    case "AMM": {
      return new AMM([(obj.value[0] && new BN(obj.value[0])) || null]);
    }
    case "Match": {
      return new Match([new PublicKey(obj.value[0]), obj.value[1]]);
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([borsh.option(borsh.u64(), "_0")], "AMM"),
    borsh.struct([borsh.publicKey("_0"), borsh.u16("_1")], "Match"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
