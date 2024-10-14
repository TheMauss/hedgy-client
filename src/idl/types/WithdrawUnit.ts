import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface SharesJSON {
  kind: "Shares";
}

export class Shares {
  static readonly discriminator = 0;
  static readonly kind = "Shares";
  readonly discriminator = 0;
  readonly kind = "Shares";

  toJSON(): SharesJSON {
    return {
      kind: "Shares",
    };
  }

  toEncodable() {
    return {
      Shares: {},
    };
  }
}

export interface TokenJSON {
  kind: "Token";
}

export class Token {
  static readonly discriminator = 1;
  static readonly kind = "Token";
  readonly discriminator = 1;
  readonly kind = "Token";

  toJSON(): TokenJSON {
    return {
      kind: "Token",
    };
  }

  toEncodable() {
    return {
      Token: {},
    };
  }
}

export interface SharesPercentJSON {
  kind: "SharesPercent";
}

export class SharesPercent {
  static readonly discriminator = 2;
  static readonly kind = "SharesPercent";
  readonly discriminator = 2;
  readonly kind = "SharesPercent";

  toJSON(): SharesPercentJSON {
    return {
      kind: "SharesPercent",
    };
  }

  toEncodable() {
    return {
      SharesPercent: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.WithdrawUnitKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Shares" in obj) {
    return new Shares();
  }
  if ("Token" in obj) {
    return new Token();
  }
  if ("SharesPercent" in obj) {
    return new SharesPercent();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.WithdrawUnitJSON): types.WithdrawUnitKind {
  switch (obj.kind) {
    case "Shares": {
      return new Shares();
    }
    case "Token": {
      return new Token();
    }
    case "SharesPercent": {
      return new SharesPercent();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Shares"),
    borsh.struct([], "Token"),
    borsh.struct([], "SharesPercent"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
