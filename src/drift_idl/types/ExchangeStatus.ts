import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface DepositPausedJSON {
  kind: "DepositPaused";
}

export class DepositPaused {
  static readonly discriminator = 0;
  static readonly kind = "DepositPaused";
  readonly discriminator = 0;
  readonly kind = "DepositPaused";

  toJSON(): DepositPausedJSON {
    return {
      kind: "DepositPaused",
    };
  }

  toEncodable() {
    return {
      DepositPaused: {},
    };
  }
}

export interface WithdrawPausedJSON {
  kind: "WithdrawPaused";
}

export class WithdrawPaused {
  static readonly discriminator = 1;
  static readonly kind = "WithdrawPaused";
  readonly discriminator = 1;
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

export interface AmmPausedJSON {
  kind: "AmmPaused";
}

export class AmmPaused {
  static readonly discriminator = 2;
  static readonly kind = "AmmPaused";
  readonly discriminator = 2;
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
  static readonly discriminator = 3;
  static readonly kind = "FillPaused";
  readonly discriminator = 3;
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

export interface LiqPausedJSON {
  kind: "LiqPaused";
}

export class LiqPaused {
  static readonly discriminator = 4;
  static readonly kind = "LiqPaused";
  readonly discriminator = 4;
  readonly kind = "LiqPaused";

  toJSON(): LiqPausedJSON {
    return {
      kind: "LiqPaused",
    };
  }

  toEncodable() {
    return {
      LiqPaused: {},
    };
  }
}

export interface FundingPausedJSON {
  kind: "FundingPaused";
}

export class FundingPaused {
  static readonly discriminator = 5;
  static readonly kind = "FundingPaused";
  readonly discriminator = 5;
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

export interface SettlePnlPausedJSON {
  kind: "SettlePnlPaused";
}

export class SettlePnlPaused {
  static readonly discriminator = 6;
  static readonly kind = "SettlePnlPaused";
  readonly discriminator = 6;
  readonly kind = "SettlePnlPaused";

  toJSON(): SettlePnlPausedJSON {
    return {
      kind: "SettlePnlPaused",
    };
  }

  toEncodable() {
    return {
      SettlePnlPaused: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.ExchangeStatusKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("DepositPaused" in obj) {
    return new DepositPaused();
  }
  if ("WithdrawPaused" in obj) {
    return new WithdrawPaused();
  }
  if ("AmmPaused" in obj) {
    return new AmmPaused();
  }
  if ("FillPaused" in obj) {
    return new FillPaused();
  }
  if ("LiqPaused" in obj) {
    return new LiqPaused();
  }
  if ("FundingPaused" in obj) {
    return new FundingPaused();
  }
  if ("SettlePnlPaused" in obj) {
    return new SettlePnlPaused();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.ExchangeStatusJSON
): types.ExchangeStatusKind {
  switch (obj.kind) {
    case "DepositPaused": {
      return new DepositPaused();
    }
    case "WithdrawPaused": {
      return new WithdrawPaused();
    }
    case "AmmPaused": {
      return new AmmPaused();
    }
    case "FillPaused": {
      return new FillPaused();
    }
    case "LiqPaused": {
      return new LiqPaused();
    }
    case "FundingPaused": {
      return new FundingPaused();
    }
    case "SettlePnlPaused": {
      return new SettlePnlPaused();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "DepositPaused"),
    borsh.struct([], "WithdrawPaused"),
    borsh.struct([], "AmmPaused"),
    borsh.struct([], "FillPaused"),
    borsh.struct([], "LiqPaused"),
    borsh.struct([], "FundingPaused"),
    borsh.struct([], "SettlePnlPaused"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
