import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface ProtocolOwnedJSON {
  kind: "ProtocolOwned";
}

export class ProtocolOwned {
  static readonly discriminator = 0;
  static readonly kind = "ProtocolOwned";
  readonly discriminator = 0;
  readonly kind = "ProtocolOwned";

  toJSON(): ProtocolOwnedJSON {
    return {
      kind: "ProtocolOwned",
    };
  }

  toEncodable() {
    return {
      ProtocolOwned: {},
    };
  }
}

export interface LPOwnedJSON {
  kind: "LPOwned";
}

export class LPOwned {
  static readonly discriminator = 1;
  static readonly kind = "LPOwned";
  readonly discriminator = 1;
  readonly kind = "LPOwned";

  toJSON(): LPOwnedJSON {
    return {
      kind: "LPOwned",
    };
  }

  toEncodable() {
    return {
      LPOwned: {},
    };
  }
}

export interface SharedJSON {
  kind: "Shared";
}

export class Shared {
  static readonly discriminator = 2;
  static readonly kind = "Shared";
  readonly discriminator = 2;
  readonly kind = "Shared";

  toJSON(): SharedJSON {
    return {
      kind: "Shared",
    };
  }

  toEncodable() {
    return {
      Shared: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.AMMLiquiditySplitKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("ProtocolOwned" in obj) {
    return new ProtocolOwned();
  }
  if ("LPOwned" in obj) {
    return new LPOwned();
  }
  if ("Shared" in obj) {
    return new Shared();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.AMMLiquiditySplitJSON
): types.AMMLiquiditySplitKind {
  switch (obj.kind) {
    case "ProtocolOwned": {
      return new ProtocolOwned();
    }
    case "LPOwned": {
      return new LPOwned();
    }
    case "Shared": {
      return new Shared();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "ProtocolOwned"),
    borsh.struct([], "LPOwned"),
    borsh.struct([], "Shared"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
