import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface DiscountJSON {
  kind: "Discount";
}

export class Discount {
  static readonly discriminator = 0;
  static readonly kind = "Discount";
  readonly discriminator = 0;
  readonly kind = "Discount";

  toJSON(): DiscountJSON {
    return {
      kind: "Discount",
    };
  }

  toEncodable() {
    return {
      Discount: {},
    };
  }
}

export interface PremiumJSON {
  kind: "Premium";
}

export class Premium {
  static readonly discriminator = 1;
  static readonly kind = "Premium";
  readonly discriminator = 1;
  readonly kind = "Premium";

  toJSON(): PremiumJSON {
    return {
      kind: "Premium",
    };
  }

  toEncodable() {
    return {
      Premium: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.LiquidationMultiplierTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Discount" in obj) {
    return new Discount();
  }
  if ("Premium" in obj) {
    return new Premium();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.LiquidationMultiplierTypeJSON
): types.LiquidationMultiplierTypeKind {
  switch (obj.kind) {
    case "Discount": {
      return new Discount();
    }
    case "Premium": {
      return new Premium();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Discount"),
    borsh.struct([], "Premium"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
