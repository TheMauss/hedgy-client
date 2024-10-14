import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface DefaultJSON {
  kind: "Default";
}

export class Default {
  static readonly discriminator = 0;
  static readonly kind = "Default";
  readonly discriminator = 0;
  readonly kind = "Default";

  toJSON(): DefaultJSON {
    return {
      kind: "Default",
    };
  }

  toEncodable() {
    return {
      Default: {},
    };
  }
}

export interface HighLeverageJSON {
  kind: "HighLeverage";
}

export class HighLeverage {
  static readonly discriminator = 1;
  static readonly kind = "HighLeverage";
  readonly discriminator = 1;
  readonly kind = "HighLeverage";

  toJSON(): HighLeverageJSON {
    return {
      kind: "HighLeverage",
    };
  }

  toEncodable() {
    return {
      HighLeverage: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.MarginModeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Default" in obj) {
    return new Default();
  }
  if ("HighLeverage" in obj) {
    return new HighLeverage();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.MarginModeJSON): types.MarginModeKind {
  switch (obj.kind) {
    case "Default": {
      return new Default();
    }
    case "HighLeverage": {
      return new HighLeverage();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Default"),
    borsh.struct([], "HighLeverage"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
