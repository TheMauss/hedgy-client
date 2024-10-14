import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface BaseJSON {
  kind: "Base";
}

export class Base {
  static readonly discriminator = 0;
  static readonly kind = "Base";
  readonly discriminator = 0;
  readonly kind = "Base";

  toJSON(): BaseJSON {
    return {
      kind: "Base",
    };
  }

  toEncodable() {
    return {
      Base: {},
    };
  }
}

export interface QuoteJSON {
  kind: "Quote";
}

export class Quote {
  static readonly discriminator = 1;
  static readonly kind = "Quote";
  readonly discriminator = 1;
  readonly kind = "Quote";

  toJSON(): QuoteJSON {
    return {
      kind: "Quote",
    };
  }

  toEncodable() {
    return {
      Quote: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.AssetTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Base" in obj) {
    return new Base();
  }
  if ("Quote" in obj) {
    return new Quote();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.AssetTypeJSON): types.AssetTypeKind {
  switch (obj.kind) {
    case "Base": {
      return new Base();
    }
    case "Quote": {
      return new Quote();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Base"),
    borsh.struct([], "Quote"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
