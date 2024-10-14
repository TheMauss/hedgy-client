import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface AddLiquidityJSON {
  kind: "AddLiquidity";
}

export class AddLiquidity {
  static readonly discriminator = 0;
  static readonly kind = "AddLiquidity";
  readonly discriminator = 0;
  readonly kind = "AddLiquidity";

  toJSON(): AddLiquidityJSON {
    return {
      kind: "AddLiquidity",
    };
  }

  toEncodable() {
    return {
      AddLiquidity: {},
    };
  }
}

export interface RemoveLiquidityJSON {
  kind: "RemoveLiquidity";
}

export class RemoveLiquidity {
  static readonly discriminator = 1;
  static readonly kind = "RemoveLiquidity";
  readonly discriminator = 1;
  readonly kind = "RemoveLiquidity";

  toJSON(): RemoveLiquidityJSON {
    return {
      kind: "RemoveLiquidity",
    };
  }

  toEncodable() {
    return {
      RemoveLiquidity: {},
    };
  }
}

export interface SettleLiquidityJSON {
  kind: "SettleLiquidity";
}

export class SettleLiquidity {
  static readonly discriminator = 2;
  static readonly kind = "SettleLiquidity";
  readonly discriminator = 2;
  readonly kind = "SettleLiquidity";

  toJSON(): SettleLiquidityJSON {
    return {
      kind: "SettleLiquidity",
    };
  }

  toEncodable() {
    return {
      SettleLiquidity: {},
    };
  }
}

export interface RemoveLiquidityDeriskJSON {
  kind: "RemoveLiquidityDerisk";
}

export class RemoveLiquidityDerisk {
  static readonly discriminator = 3;
  static readonly kind = "RemoveLiquidityDerisk";
  readonly discriminator = 3;
  readonly kind = "RemoveLiquidityDerisk";

  toJSON(): RemoveLiquidityDeriskJSON {
    return {
      kind: "RemoveLiquidityDerisk",
    };
  }

  toEncodable() {
    return {
      RemoveLiquidityDerisk: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.LPActionKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("AddLiquidity" in obj) {
    return new AddLiquidity();
  }
  if ("RemoveLiquidity" in obj) {
    return new RemoveLiquidity();
  }
  if ("SettleLiquidity" in obj) {
    return new SettleLiquidity();
  }
  if ("RemoveLiquidityDerisk" in obj) {
    return new RemoveLiquidityDerisk();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.LPActionJSON): types.LPActionKind {
  switch (obj.kind) {
    case "AddLiquidity": {
      return new AddLiquidity();
    }
    case "RemoveLiquidity": {
      return new RemoveLiquidity();
    }
    case "SettleLiquidity": {
      return new SettleLiquidity();
    }
    case "RemoveLiquidityDerisk": {
      return new RemoveLiquidityDerisk();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "AddLiquidity"),
    borsh.struct([], "RemoveLiquidity"),
    borsh.struct([], "SettleLiquidity"),
    borsh.struct([], "RemoveLiquidityDerisk"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
