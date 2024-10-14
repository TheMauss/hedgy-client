import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface UpdateFundingJSON {
  kind: "UpdateFunding";
}

export class UpdateFunding {
  static readonly discriminator = 0;
  static readonly kind = "UpdateFunding";
  readonly discriminator = 0;
  readonly kind = "UpdateFunding";

  toJSON(): UpdateFundingJSON {
    return {
      kind: "UpdateFunding",
    };
  }

  toEncodable() {
    return {
      UpdateFunding: {},
    };
  }
}

export interface AmmFillJSON {
  kind: "AmmFill";
}

export class AmmFill {
  static readonly discriminator = 1;
  static readonly kind = "AmmFill";
  readonly discriminator = 1;
  readonly kind = "AmmFill";

  toJSON(): AmmFillJSON {
    return {
      kind: "AmmFill",
    };
  }

  toEncodable() {
    return {
      AmmFill: {},
    };
  }
}

export interface FillJSON {
  kind: "Fill";
}

export class Fill {
  static readonly discriminator = 2;
  static readonly kind = "Fill";
  readonly discriminator = 2;
  readonly kind = "Fill";

  toJSON(): FillJSON {
    return {
      kind: "Fill",
    };
  }

  toEncodable() {
    return {
      Fill: {},
    };
  }
}

export interface SettlePnlJSON {
  kind: "SettlePnl";
}

export class SettlePnl {
  static readonly discriminator = 3;
  static readonly kind = "SettlePnl";
  readonly discriminator = 3;
  readonly kind = "SettlePnl";

  toJSON(): SettlePnlJSON {
    return {
      kind: "SettlePnl",
    };
  }

  toEncodable() {
    return {
      SettlePnl: {},
    };
  }
}

export interface SettlePnlWithPositionJSON {
  kind: "SettlePnlWithPosition";
}

export class SettlePnlWithPosition {
  static readonly discriminator = 4;
  static readonly kind = "SettlePnlWithPosition";
  readonly discriminator = 4;
  readonly kind = "SettlePnlWithPosition";

  toJSON(): SettlePnlWithPositionJSON {
    return {
      kind: "SettlePnlWithPosition",
    };
  }

  toEncodable() {
    return {
      SettlePnlWithPosition: {},
    };
  }
}

export interface LiquidationJSON {
  kind: "Liquidation";
}

export class Liquidation {
  static readonly discriminator = 5;
  static readonly kind = "Liquidation";
  readonly discriminator = 5;
  readonly kind = "Liquidation";

  toJSON(): LiquidationJSON {
    return {
      kind: "Liquidation",
    };
  }

  toEncodable() {
    return {
      Liquidation: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.PerpOperationKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("UpdateFunding" in obj) {
    return new UpdateFunding();
  }
  if ("AmmFill" in obj) {
    return new AmmFill();
  }
  if ("Fill" in obj) {
    return new Fill();
  }
  if ("SettlePnl" in obj) {
    return new SettlePnl();
  }
  if ("SettlePnlWithPosition" in obj) {
    return new SettlePnlWithPosition();
  }
  if ("Liquidation" in obj) {
    return new Liquidation();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.PerpOperationJSON
): types.PerpOperationKind {
  switch (obj.kind) {
    case "UpdateFunding": {
      return new UpdateFunding();
    }
    case "AmmFill": {
      return new AmmFill();
    }
    case "Fill": {
      return new Fill();
    }
    case "SettlePnl": {
      return new SettlePnl();
    }
    case "SettlePnlWithPosition": {
      return new SettlePnlWithPosition();
    }
    case "Liquidation": {
      return new Liquidation();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "UpdateFunding"),
    borsh.struct([], "AmmFill"),
    borsh.struct([], "Fill"),
    borsh.struct([], "SettlePnl"),
    borsh.struct([], "SettlePnlWithPosition"),
    borsh.struct([], "Liquidation"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
