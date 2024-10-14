import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface TryModifyJSON {
  kind: "TryModify";
}

export class TryModify {
  static readonly discriminator = 0;
  static readonly kind = "TryModify";
  readonly discriminator = 0;
  readonly kind = "TryModify";

  toJSON(): TryModifyJSON {
    return {
      kind: "TryModify",
    };
  }

  toEncodable() {
    return {
      TryModify: {},
    };
  }
}

export interface MustModifyJSON {
  kind: "MustModify";
}

export class MustModify {
  static readonly discriminator = 1;
  static readonly kind = "MustModify";
  readonly discriminator = 1;
  readonly kind = "MustModify";

  toJSON(): MustModifyJSON {
    return {
      kind: "MustModify",
    };
  }

  toEncodable() {
    return {
      MustModify: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.ModifyOrderPolicyKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("TryModify" in obj) {
    return new TryModify();
  }
  if ("MustModify" in obj) {
    return new MustModify();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.ModifyOrderPolicyJSON
): types.ModifyOrderPolicyKind {
  switch (obj.kind) {
    case "TryModify": {
      return new TryModify();
    }
    case "MustModify": {
      return new MustModify();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "TryModify"),
    borsh.struct([], "MustModify"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
