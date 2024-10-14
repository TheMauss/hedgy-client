import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface LiquidatePerpJSON {
  kind: "LiquidatePerp";
}

export class LiquidatePerp {
  static readonly discriminator = 0;
  static readonly kind = "LiquidatePerp";
  readonly discriminator = 0;
  readonly kind = "LiquidatePerp";

  toJSON(): LiquidatePerpJSON {
    return {
      kind: "LiquidatePerp",
    };
  }

  toEncodable() {
    return {
      LiquidatePerp: {},
    };
  }
}

export interface LiquidateSpotJSON {
  kind: "LiquidateSpot";
}

export class LiquidateSpot {
  static readonly discriminator = 1;
  static readonly kind = "LiquidateSpot";
  readonly discriminator = 1;
  readonly kind = "LiquidateSpot";

  toJSON(): LiquidateSpotJSON {
    return {
      kind: "LiquidateSpot",
    };
  }

  toEncodable() {
    return {
      LiquidateSpot: {},
    };
  }
}

export interface LiquidateBorrowForPerpPnlJSON {
  kind: "LiquidateBorrowForPerpPnl";
}

export class LiquidateBorrowForPerpPnl {
  static readonly discriminator = 2;
  static readonly kind = "LiquidateBorrowForPerpPnl";
  readonly discriminator = 2;
  readonly kind = "LiquidateBorrowForPerpPnl";

  toJSON(): LiquidateBorrowForPerpPnlJSON {
    return {
      kind: "LiquidateBorrowForPerpPnl",
    };
  }

  toEncodable() {
    return {
      LiquidateBorrowForPerpPnl: {},
    };
  }
}

export interface LiquidatePerpPnlForDepositJSON {
  kind: "LiquidatePerpPnlForDeposit";
}

export class LiquidatePerpPnlForDeposit {
  static readonly discriminator = 3;
  static readonly kind = "LiquidatePerpPnlForDeposit";
  readonly discriminator = 3;
  readonly kind = "LiquidatePerpPnlForDeposit";

  toJSON(): LiquidatePerpPnlForDepositJSON {
    return {
      kind: "LiquidatePerpPnlForDeposit",
    };
  }

  toEncodable() {
    return {
      LiquidatePerpPnlForDeposit: {},
    };
  }
}

export interface PerpBankruptcyJSON {
  kind: "PerpBankruptcy";
}

export class PerpBankruptcy {
  static readonly discriminator = 4;
  static readonly kind = "PerpBankruptcy";
  readonly discriminator = 4;
  readonly kind = "PerpBankruptcy";

  toJSON(): PerpBankruptcyJSON {
    return {
      kind: "PerpBankruptcy",
    };
  }

  toEncodable() {
    return {
      PerpBankruptcy: {},
    };
  }
}

export interface SpotBankruptcyJSON {
  kind: "SpotBankruptcy";
}

export class SpotBankruptcy {
  static readonly discriminator = 5;
  static readonly kind = "SpotBankruptcy";
  readonly discriminator = 5;
  readonly kind = "SpotBankruptcy";

  toJSON(): SpotBankruptcyJSON {
    return {
      kind: "SpotBankruptcy",
    };
  }

  toEncodable() {
    return {
      SpotBankruptcy: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.LiquidationTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("LiquidatePerp" in obj) {
    return new LiquidatePerp();
  }
  if ("LiquidateSpot" in obj) {
    return new LiquidateSpot();
  }
  if ("LiquidateBorrowForPerpPnl" in obj) {
    return new LiquidateBorrowForPerpPnl();
  }
  if ("LiquidatePerpPnlForDeposit" in obj) {
    return new LiquidatePerpPnlForDeposit();
  }
  if ("PerpBankruptcy" in obj) {
    return new PerpBankruptcy();
  }
  if ("SpotBankruptcy" in obj) {
    return new SpotBankruptcy();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.LiquidationTypeJSON
): types.LiquidationTypeKind {
  switch (obj.kind) {
    case "LiquidatePerp": {
      return new LiquidatePerp();
    }
    case "LiquidateSpot": {
      return new LiquidateSpot();
    }
    case "LiquidateBorrowForPerpPnl": {
      return new LiquidateBorrowForPerpPnl();
    }
    case "LiquidatePerpPnlForDeposit": {
      return new LiquidatePerpPnlForDeposit();
    }
    case "PerpBankruptcy": {
      return new PerpBankruptcy();
    }
    case "SpotBankruptcy": {
      return new SpotBankruptcy();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "LiquidatePerp"),
    borsh.struct([], "LiquidateSpot"),
    borsh.struct([], "LiquidateBorrowForPerpPnl"),
    borsh.struct([], "LiquidatePerpPnlForDeposit"),
    borsh.struct([], "PerpBankruptcy"),
    borsh.struct([], "SpotBankruptcy"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
