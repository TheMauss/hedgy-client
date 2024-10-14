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

export interface SettlePnlJSON {
  kind: "SettlePnl";
}

export class SettlePnl {
  static readonly discriminator = 1;
  static readonly kind = "SettlePnl";
  readonly discriminator = 1;
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

export interface TriggerOrderJSON {
  kind: "TriggerOrder";
}

export class TriggerOrder {
  static readonly discriminator = 2;
  static readonly kind = "TriggerOrder";
  readonly discriminator = 2;
  readonly kind = "TriggerOrder";

  toJSON(): TriggerOrderJSON {
    return {
      kind: "TriggerOrder",
    };
  }

  toEncodable() {
    return {
      TriggerOrder: {},
    };
  }
}

export interface FillOrderMatchJSON {
  kind: "FillOrderMatch";
}

export class FillOrderMatch {
  static readonly discriminator = 3;
  static readonly kind = "FillOrderMatch";
  readonly discriminator = 3;
  readonly kind = "FillOrderMatch";

  toJSON(): FillOrderMatchJSON {
    return {
      kind: "FillOrderMatch",
    };
  }

  toEncodable() {
    return {
      FillOrderMatch: {},
    };
  }
}

export interface FillOrderAmmJSON {
  kind: "FillOrderAmm";
}

export class FillOrderAmm {
  static readonly discriminator = 4;
  static readonly kind = "FillOrderAmm";
  readonly discriminator = 4;
  readonly kind = "FillOrderAmm";

  toJSON(): FillOrderAmmJSON {
    return {
      kind: "FillOrderAmm",
    };
  }

  toEncodable() {
    return {
      FillOrderAmm: {},
    };
  }
}

export interface LiquidateJSON {
  kind: "Liquidate";
}

export class Liquidate {
  static readonly discriminator = 5;
  static readonly kind = "Liquidate";
  readonly discriminator = 5;
  readonly kind = "Liquidate";

  toJSON(): LiquidateJSON {
    return {
      kind: "Liquidate",
    };
  }

  toEncodable() {
    return {
      Liquidate: {},
    };
  }
}

export interface MarginCalcJSON {
  kind: "MarginCalc";
}

export class MarginCalc {
  static readonly discriminator = 6;
  static readonly kind = "MarginCalc";
  readonly discriminator = 6;
  readonly kind = "MarginCalc";

  toJSON(): MarginCalcJSON {
    return {
      kind: "MarginCalc",
    };
  }

  toEncodable() {
    return {
      MarginCalc: {},
    };
  }
}

export interface UpdateTwapJSON {
  kind: "UpdateTwap";
}

export class UpdateTwap {
  static readonly discriminator = 7;
  static readonly kind = "UpdateTwap";
  readonly discriminator = 7;
  readonly kind = "UpdateTwap";

  toJSON(): UpdateTwapJSON {
    return {
      kind: "UpdateTwap",
    };
  }

  toEncodable() {
    return {
      UpdateTwap: {},
    };
  }
}

export interface UpdateAMMCurveJSON {
  kind: "UpdateAMMCurve";
}

export class UpdateAMMCurve {
  static readonly discriminator = 8;
  static readonly kind = "UpdateAMMCurve";
  readonly discriminator = 8;
  readonly kind = "UpdateAMMCurve";

  toJSON(): UpdateAMMCurveJSON {
    return {
      kind: "UpdateAMMCurve",
    };
  }

  toEncodable() {
    return {
      UpdateAMMCurve: {},
    };
  }
}

export interface OracleOrderPriceJSON {
  kind: "OracleOrderPrice";
}

export class OracleOrderPrice {
  static readonly discriminator = 9;
  static readonly kind = "OracleOrderPrice";
  readonly discriminator = 9;
  readonly kind = "OracleOrderPrice";

  toJSON(): OracleOrderPriceJSON {
    return {
      kind: "OracleOrderPrice",
    };
  }

  toEncodable() {
    return {
      OracleOrderPrice: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.DriftActionKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("UpdateFunding" in obj) {
    return new UpdateFunding();
  }
  if ("SettlePnl" in obj) {
    return new SettlePnl();
  }
  if ("TriggerOrder" in obj) {
    return new TriggerOrder();
  }
  if ("FillOrderMatch" in obj) {
    return new FillOrderMatch();
  }
  if ("FillOrderAmm" in obj) {
    return new FillOrderAmm();
  }
  if ("Liquidate" in obj) {
    return new Liquidate();
  }
  if ("MarginCalc" in obj) {
    return new MarginCalc();
  }
  if ("UpdateTwap" in obj) {
    return new UpdateTwap();
  }
  if ("UpdateAMMCurve" in obj) {
    return new UpdateAMMCurve();
  }
  if ("OracleOrderPrice" in obj) {
    return new OracleOrderPrice();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.DriftActionJSON): types.DriftActionKind {
  switch (obj.kind) {
    case "UpdateFunding": {
      return new UpdateFunding();
    }
    case "SettlePnl": {
      return new SettlePnl();
    }
    case "TriggerOrder": {
      return new TriggerOrder();
    }
    case "FillOrderMatch": {
      return new FillOrderMatch();
    }
    case "FillOrderAmm": {
      return new FillOrderAmm();
    }
    case "Liquidate": {
      return new Liquidate();
    }
    case "MarginCalc": {
      return new MarginCalc();
    }
    case "UpdateTwap": {
      return new UpdateTwap();
    }
    case "UpdateAMMCurve": {
      return new UpdateAMMCurve();
    }
    case "OracleOrderPrice": {
      return new OracleOrderPrice();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "UpdateFunding"),
    borsh.struct([], "SettlePnl"),
    borsh.struct([], "TriggerOrder"),
    borsh.struct([], "FillOrderMatch"),
    borsh.struct([], "FillOrderAmm"),
    borsh.struct([], "Liquidate"),
    borsh.struct([], "MarginCalc"),
    borsh.struct([], "UpdateTwap"),
    borsh.struct([], "UpdateAMMCurve"),
    borsh.struct([], "OracleOrderPrice"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
