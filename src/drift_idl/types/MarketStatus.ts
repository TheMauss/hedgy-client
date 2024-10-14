import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface InitializedJSON {
  kind: "Initialized";
}

export class Initialized {
  static readonly discriminator = 0;
  static readonly kind = "Initialized";
  readonly discriminator = 0;
  readonly kind = "Initialized";

  toJSON(): InitializedJSON {
    return {
      kind: "Initialized",
    };
  }

  toEncodable() {
    return {
      Initialized: {},
    };
  }
}

export interface ActiveJSON {
  kind: "Active";
}

export class Active {
  static readonly discriminator = 1;
  static readonly kind = "Active";
  readonly discriminator = 1;
  readonly kind = "Active";

  toJSON(): ActiveJSON {
    return {
      kind: "Active",
    };
  }

  toEncodable() {
    return {
      Active: {},
    };
  }
}

export interface FundingPausedJSON {
  kind: "FundingPaused";
}

export class FundingPaused {
  static readonly discriminator = 2;
  static readonly kind = "FundingPaused";
  readonly discriminator = 2;
  readonly kind = "FundingPaused";

  toJSON(): FundingPausedJSON {
    return {
      kind: "FundingPaused",
    };
  }

  toEncodable() {
    return {
      FundingPaused: {},
    };
  }
}

export interface AmmPausedJSON {
  kind: "AmmPaused";
}

export class AmmPaused {
  static readonly discriminator = 3;
  static readonly kind = "AmmPaused";
  readonly discriminator = 3;
  readonly kind = "AmmPaused";

  toJSON(): AmmPausedJSON {
    return {
      kind: "AmmPaused",
    };
  }

  toEncodable() {
    return {
      AmmPaused: {},
    };
  }
}

export interface FillPausedJSON {
  kind: "FillPaused";
}

export class FillPaused {
  static readonly discriminator = 4;
  static readonly kind = "FillPaused";
  readonly discriminator = 4;
  readonly kind = "FillPaused";

  toJSON(): FillPausedJSON {
    return {
      kind: "FillPaused",
    };
  }

  toEncodable() {
    return {
      FillPaused: {},
    };
  }
}

export interface WithdrawPausedJSON {
  kind: "WithdrawPaused";
}

export class WithdrawPaused {
  static readonly discriminator = 5;
  static readonly kind = "WithdrawPaused";
  readonly discriminator = 5;
  readonly kind = "WithdrawPaused";

  toJSON(): WithdrawPausedJSON {
    return {
      kind: "WithdrawPaused",
    };
  }

  toEncodable() {
    return {
      WithdrawPaused: {},
    };
  }
}

export interface ReduceOnlyJSON {
  kind: "ReduceOnly";
}

export class ReduceOnly {
  static readonly discriminator = 6;
  static readonly kind = "ReduceOnly";
  readonly discriminator = 6;
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

export interface SettlementJSON {
  kind: "Settlement";
}

export class Settlement {
  static readonly discriminator = 7;
  static readonly kind = "Settlement";
  readonly discriminator = 7;
  readonly kind = "Settlement";

  toJSON(): SettlementJSON {
    return {
      kind: "Settlement",
    };
  }

  toEncodable() {
    return {
      Settlement: {},
    };
  }
}

export interface DelistedJSON {
  kind: "Delisted";
}

export class Delisted {
  static readonly discriminator = 8;
  static readonly kind = "Delisted";
  readonly discriminator = 8;
  readonly kind = "Delisted";

  toJSON(): DelistedJSON {
    return {
      kind: "Delisted",
    };
  }

  toEncodable() {
    return {
      Delisted: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.MarketStatusKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Initialized" in obj) {
    return new Initialized();
  }
  if ("Active" in obj) {
    return new Active();
  }
  if ("FundingPaused" in obj) {
    return new FundingPaused();
  }
  if ("AmmPaused" in obj) {
    return new AmmPaused();
  }
  if ("FillPaused" in obj) {
    return new FillPaused();
  }
  if ("WithdrawPaused" in obj) {
    return new WithdrawPaused();
  }
  if ("ReduceOnly" in obj) {
    return new ReduceOnly();
  }
  if ("Settlement" in obj) {
    return new Settlement();
  }
  if ("Delisted" in obj) {
    return new Delisted();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.MarketStatusJSON): types.MarketStatusKind {
  switch (obj.kind) {
    case "Initialized": {
      return new Initialized();
    }
    case "Active": {
      return new Active();
    }
    case "FundingPaused": {
      return new FundingPaused();
    }
    case "AmmPaused": {
      return new AmmPaused();
    }
    case "FillPaused": {
      return new FillPaused();
    }
    case "WithdrawPaused": {
      return new WithdrawPaused();
    }
    case "ReduceOnly": {
      return new ReduceOnly();
    }
    case "Settlement": {
      return new Settlement();
    }
    case "Delisted": {
      return new Delisted();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Initialized"),
    borsh.struct([], "Active"),
    borsh.struct([], "FundingPaused"),
    borsh.struct([], "AmmPaused"),
    borsh.struct([], "FillPaused"),
    borsh.struct([], "WithdrawPaused"),
    borsh.struct([], "ReduceOnly"),
    borsh.struct([], "Settlement"),
    borsh.struct([], "Delisted"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
