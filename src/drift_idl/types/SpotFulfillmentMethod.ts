import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface ExternalMarketJSON {
  kind: "ExternalMarket";
}

export class ExternalMarket {
  static readonly discriminator = 0;
  static readonly kind = "ExternalMarket";
  readonly discriminator = 0;
  readonly kind = "ExternalMarket";

  toJSON(): ExternalMarketJSON {
    return {
      kind: "ExternalMarket",
    };
  }

  toEncodable() {
    return {
      ExternalMarket: {},
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
export function fromDecoded(obj: any): types.SpotFulfillmentMethodKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("ExternalMarket" in obj) {
    return new ExternalMarket();
  }
  if ("Match" in obj) {
    const val = obj["Match"];
    return new Match([val["_0"], val["_1"]]);
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.SpotFulfillmentMethodJSON
): types.SpotFulfillmentMethodKind {
  switch (obj.kind) {
    case "ExternalMarket": {
      return new ExternalMarket();
    }
    case "Match": {
      return new Match([new PublicKey(obj.value[0]), obj.value[1]]);
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "ExternalMarket"),
    borsh.struct([borsh.publicKey("_0"), borsh.u16("_1")], "Match"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
