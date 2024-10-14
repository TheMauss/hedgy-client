import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface BeingLiquidatedJSON {
  kind: "BeingLiquidated";
}

export class BeingLiquidated {
  static readonly discriminator = 0;
  static readonly kind = "BeingLiquidated";
  readonly discriminator = 0;
  readonly kind = "BeingLiquidated";

  toJSON(): BeingLiquidatedJSON {
    return {
      kind: "BeingLiquidated",
    };
  }

  toEncodable() {
    return {
      BeingLiquidated: {},
    };
  }
}

export interface BankruptJSON {
  kind: "Bankrupt";
}

export class Bankrupt {
  static readonly discriminator = 1;
  static readonly kind = "Bankrupt";
  readonly discriminator = 1;
  readonly kind = "Bankrupt";

  toJSON(): BankruptJSON {
    return {
      kind: "Bankrupt",
    };
  }

  toEncodable() {
    return {
      Bankrupt: {},
    };
  }
}

export interface ReduceOnlyJSON {
  kind: "ReduceOnly";
}

export class ReduceOnly {
  static readonly discriminator = 2;
  static readonly kind = "ReduceOnly";
  readonly discriminator = 2;
  readonly kind = "ReduceOnly";

  toJSON(): ReduceOnlyJSON {
    return {
      kind: "ReduceOnly",
    };
  }

  toEncodable() {
    return {
      ReduceOnly: {},
    };
  }
}

export interface AdvancedLpJSON {
  kind: "AdvancedLp";
}

export class AdvancedLp {
  static readonly discriminator = 3;
  static readonly kind = "AdvancedLp";
  readonly discriminator = 3;
  readonly kind = "AdvancedLp";

  toJSON(): AdvancedLpJSON {
    return {
      kind: "AdvancedLp",
    };
  }

  toEncodable() {
    return {
      AdvancedLp: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.UserStatusKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("BeingLiquidated" in obj) {
    return new BeingLiquidated();
  }
  if ("Bankrupt" in obj) {
    return new Bankrupt();
  }
  if ("ReduceOnly" in obj) {
    return new ReduceOnly();
  }
  if ("AdvancedLp" in obj) {
    return new AdvancedLp();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.UserStatusJSON): types.UserStatusKind {
  switch (obj.kind) {
    case "BeingLiquidated": {
      return new BeingLiquidated();
    }
    case "Bankrupt": {
      return new Bankrupt();
    }
    case "ReduceOnly": {
      return new ReduceOnly();
    }
    case "AdvancedLp": {
      return new AdvancedLp();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "BeingLiquidated"),
    borsh.struct([], "Bankrupt"),
    borsh.struct([], "ReduceOnly"),
    borsh.struct([], "AdvancedLp"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
