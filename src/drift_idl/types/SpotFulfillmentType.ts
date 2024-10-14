import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface SerumV3JSON {
  kind: "SerumV3";
}

export class SerumV3 {
  static readonly discriminator = 0;
  static readonly kind = "SerumV3";
  readonly discriminator = 0;
  readonly kind = "SerumV3";

  toJSON(): SerumV3JSON {
    return {
      kind: "SerumV3",
    };
  }

  toEncodable() {
    return {
      SerumV3: {},
    };
  }
}

export interface MatchJSON {
  kind: "Match";
}

export class Match {
  static readonly discriminator = 1;
  static readonly kind = "Match";
  readonly discriminator = 1;
  readonly kind = "Match";

  toJSON(): MatchJSON {
    return {
      kind: "Match",
    };
  }

  toEncodable() {
    return {
      Match: {},
    };
  }
}

export interface PhoenixV1JSON {
  kind: "PhoenixV1";
}

export class PhoenixV1 {
  static readonly discriminator = 2;
  static readonly kind = "PhoenixV1";
  readonly discriminator = 2;
  readonly kind = "PhoenixV1";

  toJSON(): PhoenixV1JSON {
    return {
      kind: "PhoenixV1",
    };
  }

  toEncodable() {
    return {
      PhoenixV1: {},
    };
  }
}

export interface OpenbookV2JSON {
  kind: "OpenbookV2";
}

export class OpenbookV2 {
  static readonly discriminator = 3;
  static readonly kind = "OpenbookV2";
  readonly discriminator = 3;
  readonly kind = "OpenbookV2";

  toJSON(): OpenbookV2JSON {
    return {
      kind: "OpenbookV2",
    };
  }

  toEncodable() {
    return {
      OpenbookV2: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.SpotFulfillmentTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("SerumV3" in obj) {
    return new SerumV3();
  }
  if ("Match" in obj) {
    return new Match();
  }
  if ("PhoenixV1" in obj) {
    return new PhoenixV1();
  }
  if ("OpenbookV2" in obj) {
    return new OpenbookV2();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.SpotFulfillmentTypeJSON
): types.SpotFulfillmentTypeKind {
  switch (obj.kind) {
    case "SerumV3": {
      return new SerumV3();
    }
    case "Match": {
      return new Match();
    }
    case "PhoenixV1": {
      return new PhoenixV1();
    }
    case "OpenbookV2": {
      return new OpenbookV2();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "SerumV3"),
    borsh.struct([], "Match"),
    borsh.struct([], "PhoenixV1"),
    borsh.struct([], "OpenbookV2"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
