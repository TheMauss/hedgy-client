import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface FundingPeriodJSON {
  kind: "FundingPeriod";
}

export class FundingPeriod {
  static readonly discriminator = 0;
  static readonly kind = "FundingPeriod";
  readonly discriminator = 0;
  readonly kind = "FundingPeriod";

  toJSON(): FundingPeriodJSON {
    return {
      kind: "FundingPeriod",
    };
  }

  toEncodable() {
    return {
      FundingPeriod: {},
    };
  }
}

export interface FiveMinJSON {
  kind: "FiveMin";
}

export class FiveMin {
  static readonly discriminator = 1;
  static readonly kind = "FiveMin";
  readonly discriminator = 1;
  readonly kind = "FiveMin";

  toJSON(): FiveMinJSON {
    return {
      kind: "FiveMin",
    };
  }

  toEncodable() {
    return {
      FiveMin: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.TwapPeriodKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("FundingPeriod" in obj) {
    return new FundingPeriod();
  }
  if ("FiveMin" in obj) {
    return new FiveMin();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.TwapPeriodJSON): types.TwapPeriodKind {
  switch (obj.kind) {
    case "FundingPeriod": {
      return new FundingPeriod();
    }
    case "FiveMin": {
      return new FiveMin();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "FundingPeriod"),
    borsh.struct([], "FiveMin"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
