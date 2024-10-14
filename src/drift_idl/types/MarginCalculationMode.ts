import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export type StandardFields = {
  trackOpenOrdersFraction: boolean;
};
export type StandardValue = {
  trackOpenOrdersFraction: boolean;
};

export interface StandardJSON {
  kind: "Standard";
  value: {
    trackOpenOrdersFraction: boolean;
  };
}

export class Standard {
  static readonly discriminator = 0;
  static readonly kind = "Standard";
  readonly discriminator = 0;
  readonly kind = "Standard";
  readonly value: StandardValue;

  constructor(value: StandardFields) {
    this.value = {
      trackOpenOrdersFraction: value.trackOpenOrdersFraction,
    };
  }

  toJSON(): StandardJSON {
    return {
      kind: "Standard",
      value: {
        trackOpenOrdersFraction: this.value.trackOpenOrdersFraction,
      },
    };
  }

  toEncodable() {
    return {
      Standard: {
        trackOpenOrdersFraction: this.value.trackOpenOrdersFraction,
      },
    };
  }
}

export type LiquidationFields = {
  marketToTrackMarginRequirement: types.MarketIdentifierFields | null;
};
export type LiquidationValue = {
  marketToTrackMarginRequirement: types.MarketIdentifier | null;
};

export interface LiquidationJSON {
  kind: "Liquidation";
  value: {
    marketToTrackMarginRequirement: types.MarketIdentifierJSON | null;
  };
}

export class Liquidation {
  static readonly discriminator = 1;
  static readonly kind = "Liquidation";
  readonly discriminator = 1;
  readonly kind = "Liquidation";
  readonly value: LiquidationValue;

  constructor(value: LiquidationFields) {
    this.value = {
      marketToTrackMarginRequirement:
        (value.marketToTrackMarginRequirement &&
          new types.MarketIdentifier({
            ...value.marketToTrackMarginRequirement,
          })) ||
        null,
    };
  }

  toJSON(): LiquidationJSON {
    return {
      kind: "Liquidation",
      value: {
        marketToTrackMarginRequirement:
          (this.value.marketToTrackMarginRequirement &&
            this.value.marketToTrackMarginRequirement.toJSON()) ||
          null,
      },
    };
  }

  toEncodable() {
    return {
      Liquidation: {
        marketToTrackMarginRequirement:
          (this.value.marketToTrackMarginRequirement &&
            types.MarketIdentifier.toEncodable(
              this.value.marketToTrackMarginRequirement
            )) ||
          null,
      },
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.MarginCalculationModeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Standard" in obj) {
    const val = obj["Standard"];
    return new Standard({
      trackOpenOrdersFraction: val["trackOpenOrdersFraction"],
    });
  }
  if ("Liquidation" in obj) {
    const val = obj["Liquidation"];
    return new Liquidation({
      marketToTrackMarginRequirement:
        (val["marketToTrackMarginRequirement"] &&
          types.MarketIdentifier.fromDecoded(
            val["marketToTrackMarginRequirement"]
          )) ||
        null,
    });
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.MarginCalculationModeJSON
): types.MarginCalculationModeKind {
  switch (obj.kind) {
    case "Standard": {
      return new Standard({
        trackOpenOrdersFraction: obj.value.trackOpenOrdersFraction,
      });
    }
    case "Liquidation": {
      return new Liquidation({
        marketToTrackMarginRequirement:
          (obj.value.marketToTrackMarginRequirement &&
            types.MarketIdentifier.fromJSON(
              obj.value.marketToTrackMarginRequirement
            )) ||
          null,
      });
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([borsh.bool("trackOpenOrdersFraction")], "Standard"),
    borsh.struct(
      [
        borsh.option(
          types.MarketIdentifier.layout(),
          "marketToTrackMarginRequirement"
        ),
      ],
      "Liquidation"
    ),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
