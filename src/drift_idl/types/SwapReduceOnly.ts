import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface InJSON {
  kind: "In";
}

export class In {
  static readonly discriminator = 0;
  static readonly kind = "In";
  readonly discriminator = 0;
  readonly kind = "In";

  toJSON(): InJSON {
    return {
      kind: "In",
    };
  }

  toEncodable() {
    return {
      In: {},
    };
  }
}

export interface OutJSON {
  kind: "Out";
}

export class Out {
  static readonly discriminator = 1;
  static readonly kind = "Out";
  readonly discriminator = 1;
  readonly kind = "Out";

  toJSON(): OutJSON {
    return {
      kind: "Out",
    };
  }

  toEncodable() {
    return {
      Out: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.SwapReduceOnlyKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("In" in obj) {
    return new In();
  }
  if ("Out" in obj) {
    return new Out();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.SwapReduceOnlyJSON
): types.SwapReduceOnlyKind {
  switch (obj.kind) {
    case "In": {
      return new In();
    }
    case "Out": {
      return new Out();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([borsh.struct([], "In"), borsh.struct([], "Out")]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
