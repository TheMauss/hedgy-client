import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface SpotJSON {
  kind: "Spot";
}

export class Spot {
  static readonly discriminator = 0;
  static readonly kind = "Spot";
  readonly discriminator = 0;
  readonly kind = "Spot";

  toJSON(): SpotJSON {
    return {
      kind: "Spot",
    };
  }

  toEncodable() {
    return {
      Spot: {},
    };
  }
}

export interface PerpJSON {
  kind: "Perp";
}

export class Perp {
  static readonly discriminator = 1;
  static readonly kind = "Perp";
  readonly discriminator = 1;
  readonly kind = "Perp";

  toJSON(): PerpJSON {
    return {
      kind: "Perp",
    };
  }

  toEncodable() {
    return {
      Perp: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.MarketTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Spot" in obj) {
    return new Spot();
  }
  if ("Perp" in obj) {
    return new Perp();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.MarketTypeJSON): types.MarketTypeKind {
  switch (obj.kind) {
    case "Spot": {
      return new Spot();
    }
    case "Perp": {
      return new Perp();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Spot"),
    borsh.struct([], "Perp"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
