import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface NoneJSON {
  kind: "None";
}

export class None {
  static readonly discriminator = 0;
  static readonly kind = "None";
  readonly discriminator = 0;
  readonly kind = "None";

  toJSON(): NoneJSON {
    return {
      kind: "None",
    };
  }

  toEncodable() {
    return {
      None: {},
    };
  }
}

export interface InsufficientFreeCollateralJSON {
  kind: "InsufficientFreeCollateral";
}

export class InsufficientFreeCollateral {
  static readonly discriminator = 1;
  static readonly kind = "InsufficientFreeCollateral";
  readonly discriminator = 1;
  readonly kind = "InsufficientFreeCollateral";

  toJSON(): InsufficientFreeCollateralJSON {
    return {
      kind: "InsufficientFreeCollateral",
    };
  }

  toEncodable() {
    return {
      InsufficientFreeCollateral: {},
    };
  }
}

export interface OraclePriceBreachedLimitPriceJSON {
  kind: "OraclePriceBreachedLimitPrice";
}

export class OraclePriceBreachedLimitPrice {
  static readonly discriminator = 2;
  static readonly kind = "OraclePriceBreachedLimitPrice";
  readonly discriminator = 2;
  readonly kind = "OraclePriceBreachedLimitPrice";

  toJSON(): OraclePriceBreachedLimitPriceJSON {
    return {
      kind: "OraclePriceBreachedLimitPrice",
    };
  }

  toEncodable() {
    return {
      OraclePriceBreachedLimitPrice: {},
    };
  }
}

export interface MarketOrderFilledToLimitPriceJSON {
  kind: "MarketOrderFilledToLimitPrice";
}

export class MarketOrderFilledToLimitPrice {
  static readonly discriminator = 3;
  static readonly kind = "MarketOrderFilledToLimitPrice";
  readonly discriminator = 3;
  readonly kind = "MarketOrderFilledToLimitPrice";

  toJSON(): MarketOrderFilledToLimitPriceJSON {
    return {
      kind: "MarketOrderFilledToLimitPrice",
    };
  }

  toEncodable() {
    return {
      MarketOrderFilledToLimitPrice: {},
    };
  }
}

export interface OrderExpiredJSON {
  kind: "OrderExpired";
}

export class OrderExpired {
  static readonly discriminator = 4;
  static readonly kind = "OrderExpired";
  readonly discriminator = 4;
  readonly kind = "OrderExpired";

  toJSON(): OrderExpiredJSON {
    return {
      kind: "OrderExpired",
    };
  }

  toEncodable() {
    return {
      OrderExpired: {},
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

export interface OrderFilledWithAMMJSON {
  kind: "OrderFilledWithAMM";
}

export class OrderFilledWithAMM {
  static readonly discriminator = 6;
  static readonly kind = "OrderFilledWithAMM";
  readonly discriminator = 6;
  readonly kind = "OrderFilledWithAMM";

  toJSON(): OrderFilledWithAMMJSON {
    return {
      kind: "OrderFilledWithAMM",
    };
  }

  toEncodable() {
    return {
      OrderFilledWithAMM: {},
    };
  }
}

export interface OrderFilledWithAMMJitJSON {
  kind: "OrderFilledWithAMMJit";
}

export class OrderFilledWithAMMJit {
  static readonly discriminator = 7;
  static readonly kind = "OrderFilledWithAMMJit";
  readonly discriminator = 7;
  readonly kind = "OrderFilledWithAMMJit";

  toJSON(): OrderFilledWithAMMJitJSON {
    return {
      kind: "OrderFilledWithAMMJit",
    };
  }

  toEncodable() {
    return {
      OrderFilledWithAMMJit: {},
    };
  }
}

export interface OrderFilledWithMatchJSON {
  kind: "OrderFilledWithMatch";
}

export class OrderFilledWithMatch {
  static readonly discriminator = 8;
  static readonly kind = "OrderFilledWithMatch";
  readonly discriminator = 8;
  readonly kind = "OrderFilledWithMatch";

  toJSON(): OrderFilledWithMatchJSON {
    return {
      kind: "OrderFilledWithMatch",
    };
  }

  toEncodable() {
    return {
      OrderFilledWithMatch: {},
    };
  }
}

export interface OrderFilledWithMatchJitJSON {
  kind: "OrderFilledWithMatchJit";
}

export class OrderFilledWithMatchJit {
  static readonly discriminator = 9;
  static readonly kind = "OrderFilledWithMatchJit";
  readonly discriminator = 9;
  readonly kind = "OrderFilledWithMatchJit";

  toJSON(): OrderFilledWithMatchJitJSON {
    return {
      kind: "OrderFilledWithMatchJit",
    };
  }

  toEncodable() {
    return {
      OrderFilledWithMatchJit: {},
    };
  }
}

export interface MarketExpiredJSON {
  kind: "MarketExpired";
}

export class MarketExpired {
  static readonly discriminator = 10;
  static readonly kind = "MarketExpired";
  readonly discriminator = 10;
  readonly kind = "MarketExpired";

  toJSON(): MarketExpiredJSON {
    return {
      kind: "MarketExpired",
    };
  }

  toEncodable() {
    return {
      MarketExpired: {},
    };
  }
}

export interface RiskingIncreasingOrderJSON {
  kind: "RiskingIncreasingOrder";
}

export class RiskingIncreasingOrder {
  static readonly discriminator = 11;
  static readonly kind = "RiskingIncreasingOrder";
  readonly discriminator = 11;
  readonly kind = "RiskingIncreasingOrder";

  toJSON(): RiskingIncreasingOrderJSON {
    return {
      kind: "RiskingIncreasingOrder",
    };
  }

  toEncodable() {
    return {
      RiskingIncreasingOrder: {},
    };
  }
}

export interface ReduceOnlyOrderIncreasedPositionJSON {
  kind: "ReduceOnlyOrderIncreasedPosition";
}

export class ReduceOnlyOrderIncreasedPosition {
  static readonly discriminator = 12;
  static readonly kind = "ReduceOnlyOrderIncreasedPosition";
  readonly discriminator = 12;
  readonly kind = "ReduceOnlyOrderIncreasedPosition";

  toJSON(): ReduceOnlyOrderIncreasedPositionJSON {
    return {
      kind: "ReduceOnlyOrderIncreasedPosition",
    };
  }

  toEncodable() {
    return {
      ReduceOnlyOrderIncreasedPosition: {},
    };
  }
}

export interface OrderFillWithSerumJSON {
  kind: "OrderFillWithSerum";
}

export class OrderFillWithSerum {
  static readonly discriminator = 13;
  static readonly kind = "OrderFillWithSerum";
  readonly discriminator = 13;
  readonly kind = "OrderFillWithSerum";

  toJSON(): OrderFillWithSerumJSON {
    return {
      kind: "OrderFillWithSerum",
    };
  }

  toEncodable() {
    return {
      OrderFillWithSerum: {},
    };
  }
}

export interface NoBorrowLiquidityJSON {
  kind: "NoBorrowLiquidity";
}

export class NoBorrowLiquidity {
  static readonly discriminator = 14;
  static readonly kind = "NoBorrowLiquidity";
  readonly discriminator = 14;
  readonly kind = "NoBorrowLiquidity";

  toJSON(): NoBorrowLiquidityJSON {
    return {
      kind: "NoBorrowLiquidity",
    };
  }

  toEncodable() {
    return {
      NoBorrowLiquidity: {},
    };
  }
}

export interface OrderFillWithPhoenixJSON {
  kind: "OrderFillWithPhoenix";
}

export class OrderFillWithPhoenix {
  static readonly discriminator = 15;
  static readonly kind = "OrderFillWithPhoenix";
  readonly discriminator = 15;
  readonly kind = "OrderFillWithPhoenix";

  toJSON(): OrderFillWithPhoenixJSON {
    return {
      kind: "OrderFillWithPhoenix",
    };
  }

  toEncodable() {
    return {
      OrderFillWithPhoenix: {},
    };
  }
}

export interface OrderFilledWithAMMJitLPSplitJSON {
  kind: "OrderFilledWithAMMJitLPSplit";
}

export class OrderFilledWithAMMJitLPSplit {
  static readonly discriminator = 16;
  static readonly kind = "OrderFilledWithAMMJitLPSplit";
  readonly discriminator = 16;
  readonly kind = "OrderFilledWithAMMJitLPSplit";

  toJSON(): OrderFilledWithAMMJitLPSplitJSON {
    return {
      kind: "OrderFilledWithAMMJitLPSplit",
    };
  }

  toEncodable() {
    return {
      OrderFilledWithAMMJitLPSplit: {},
    };
  }
}

export interface OrderFilledWithLPJitJSON {
  kind: "OrderFilledWithLPJit";
}

export class OrderFilledWithLPJit {
  static readonly discriminator = 17;
  static readonly kind = "OrderFilledWithLPJit";
  readonly discriminator = 17;
  readonly kind = "OrderFilledWithLPJit";

  toJSON(): OrderFilledWithLPJitJSON {
    return {
      kind: "OrderFilledWithLPJit",
    };
  }

  toEncodable() {
    return {
      OrderFilledWithLPJit: {},
    };
  }
}

export interface DeriskLpJSON {
  kind: "DeriskLp";
}

export class DeriskLp {
  static readonly discriminator = 18;
  static readonly kind = "DeriskLp";
  readonly discriminator = 18;
  readonly kind = "DeriskLp";

  toJSON(): DeriskLpJSON {
    return {
      kind: "DeriskLp",
    };
  }

  toEncodable() {
    return {
      DeriskLp: {},
    };
  }
}

export interface OrderFilledWithOpenbookV2JSON {
  kind: "OrderFilledWithOpenbookV2";
}

export class OrderFilledWithOpenbookV2 {
  static readonly discriminator = 19;
  static readonly kind = "OrderFilledWithOpenbookV2";
  readonly discriminator = 19;
  readonly kind = "OrderFilledWithOpenbookV2";

  toJSON(): OrderFilledWithOpenbookV2JSON {
    return {
      kind: "OrderFilledWithOpenbookV2",
    };
  }

  toEncodable() {
    return {
      OrderFilledWithOpenbookV2: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.OrderActionExplanationKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("None" in obj) {
    return new None();
  }
  if ("InsufficientFreeCollateral" in obj) {
    return new InsufficientFreeCollateral();
  }
  if ("OraclePriceBreachedLimitPrice" in obj) {
    return new OraclePriceBreachedLimitPrice();
  }
  if ("MarketOrderFilledToLimitPrice" in obj) {
    return new MarketOrderFilledToLimitPrice();
  }
  if ("OrderExpired" in obj) {
    return new OrderExpired();
  }
  if ("Liquidation" in obj) {
    return new Liquidation();
  }
  if ("OrderFilledWithAMM" in obj) {
    return new OrderFilledWithAMM();
  }
  if ("OrderFilledWithAMMJit" in obj) {
    return new OrderFilledWithAMMJit();
  }
  if ("OrderFilledWithMatch" in obj) {
    return new OrderFilledWithMatch();
  }
  if ("OrderFilledWithMatchJit" in obj) {
    return new OrderFilledWithMatchJit();
  }
  if ("MarketExpired" in obj) {
    return new MarketExpired();
  }
  if ("RiskingIncreasingOrder" in obj) {
    return new RiskingIncreasingOrder();
  }
  if ("ReduceOnlyOrderIncreasedPosition" in obj) {
    return new ReduceOnlyOrderIncreasedPosition();
  }
  if ("OrderFillWithSerum" in obj) {
    return new OrderFillWithSerum();
  }
  if ("NoBorrowLiquidity" in obj) {
    return new NoBorrowLiquidity();
  }
  if ("OrderFillWithPhoenix" in obj) {
    return new OrderFillWithPhoenix();
  }
  if ("OrderFilledWithAMMJitLPSplit" in obj) {
    return new OrderFilledWithAMMJitLPSplit();
  }
  if ("OrderFilledWithLPJit" in obj) {
    return new OrderFilledWithLPJit();
  }
  if ("DeriskLp" in obj) {
    return new DeriskLp();
  }
  if ("OrderFilledWithOpenbookV2" in obj) {
    return new OrderFilledWithOpenbookV2();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.OrderActionExplanationJSON
): types.OrderActionExplanationKind {
  switch (obj.kind) {
    case "None": {
      return new None();
    }
    case "InsufficientFreeCollateral": {
      return new InsufficientFreeCollateral();
    }
    case "OraclePriceBreachedLimitPrice": {
      return new OraclePriceBreachedLimitPrice();
    }
    case "MarketOrderFilledToLimitPrice": {
      return new MarketOrderFilledToLimitPrice();
    }
    case "OrderExpired": {
      return new OrderExpired();
    }
    case "Liquidation": {
      return new Liquidation();
    }
    case "OrderFilledWithAMM": {
      return new OrderFilledWithAMM();
    }
    case "OrderFilledWithAMMJit": {
      return new OrderFilledWithAMMJit();
    }
    case "OrderFilledWithMatch": {
      return new OrderFilledWithMatch();
    }
    case "OrderFilledWithMatchJit": {
      return new OrderFilledWithMatchJit();
    }
    case "MarketExpired": {
      return new MarketExpired();
    }
    case "RiskingIncreasingOrder": {
      return new RiskingIncreasingOrder();
    }
    case "ReduceOnlyOrderIncreasedPosition": {
      return new ReduceOnlyOrderIncreasedPosition();
    }
    case "OrderFillWithSerum": {
      return new OrderFillWithSerum();
    }
    case "NoBorrowLiquidity": {
      return new NoBorrowLiquidity();
    }
    case "OrderFillWithPhoenix": {
      return new OrderFillWithPhoenix();
    }
    case "OrderFilledWithAMMJitLPSplit": {
      return new OrderFilledWithAMMJitLPSplit();
    }
    case "OrderFilledWithLPJit": {
      return new OrderFilledWithLPJit();
    }
    case "DeriskLp": {
      return new DeriskLp();
    }
    case "OrderFilledWithOpenbookV2": {
      return new OrderFilledWithOpenbookV2();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "None"),
    borsh.struct([], "InsufficientFreeCollateral"),
    borsh.struct([], "OraclePriceBreachedLimitPrice"),
    borsh.struct([], "MarketOrderFilledToLimitPrice"),
    borsh.struct([], "OrderExpired"),
    borsh.struct([], "Liquidation"),
    borsh.struct([], "OrderFilledWithAMM"),
    borsh.struct([], "OrderFilledWithAMMJit"),
    borsh.struct([], "OrderFilledWithMatch"),
    borsh.struct([], "OrderFilledWithMatchJit"),
    borsh.struct([], "MarketExpired"),
    borsh.struct([], "RiskingIncreasingOrder"),
    borsh.struct([], "ReduceOnlyOrderIncreasedPosition"),
    borsh.struct([], "OrderFillWithSerum"),
    borsh.struct([], "NoBorrowLiquidity"),
    borsh.struct([], "OrderFillWithPhoenix"),
    borsh.struct([], "OrderFilledWithAMMJitLPSplit"),
    borsh.struct([], "OrderFilledWithLPJit"),
    borsh.struct([], "DeriskLp"),
    borsh.struct([], "OrderFilledWithOpenbookV2"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
