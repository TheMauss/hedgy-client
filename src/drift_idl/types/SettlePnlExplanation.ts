import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface NoneJSON {
  kind: "None";
}

export class None {
  static readonly discriminator = 0;
  static readonly kind = "None";
  readonly discriminator = 0;
  readonly kind = "None";

  toJSON(): NoneJSON {
    return {
      kind: "None",
    };
  }

  toEncodable() {
    return {
      None: {},
    };
  }
}

export interface ExpiredPositionJSON {
  kind: "ExpiredPosition";
}

export class ExpiredPosition {
  static readonly discriminator = 1;
  static readonly kind = "ExpiredPosition";
  readonly discriminator = 1;
  readonly kind = "ExpiredPosition";

  toJSON(): ExpiredPositionJSON {
    return {
      kind: "ExpiredPosition",
    };
  }

  toEncodable() {
    return {
      ExpiredPosition: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.SettlePnlExplanationKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("None" in obj) {
    return new None();
  }
  if ("ExpiredPosition" in obj) {
    return new ExpiredPosition();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.SettlePnlExplanationJSON
): types.SettlePnlExplanationKind {
  switch (obj.kind) {
    case "None": {
      return new None();
    }
    case "ExpiredPosition": {
      return new ExpiredPosition();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "None"),
    borsh.struct([], "ExpiredPosition"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
