import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface MustSettleJSON {
  kind: "MustSettle";
}

export class MustSettle {
  static readonly discriminator = 0;
  static readonly kind = "MustSettle";
  readonly discriminator = 0;
  readonly kind = "MustSettle";

  toJSON(): MustSettleJSON {
    return {
      kind: "MustSettle",
    };
  }

  toEncodable() {
    return {
      MustSettle: {},
    };
  }
}

export interface TrySettleJSON {
  kind: "TrySettle";
}

export class TrySettle {
  static readonly discriminator = 1;
  static readonly kind = "TrySettle";
  readonly discriminator = 1;
  readonly kind = "TrySettle";

  toJSON(): TrySettleJSON {
    return {
      kind: "TrySettle",
    };
  }

  toEncodable() {
    return {
      TrySettle: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.SettlePnlModeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("MustSettle" in obj) {
    return new MustSettle();
  }
  if ("TrySettle" in obj) {
    return new TrySettle();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.SettlePnlModeJSON
): types.SettlePnlModeKind {
  switch (obj.kind) {
    case "MustSettle": {
      return new MustSettle();
    }
    case "TrySettle": {
      return new TrySettle();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "MustSettle"),
    borsh.struct([], "TrySettle"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
