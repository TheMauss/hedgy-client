import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface FillJSON {
  kind: "Fill";
}

export class Fill {
  static readonly discriminator = 0;
  static readonly kind = "Fill";
  readonly discriminator = 0;
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

export interface PlaceAndMakeJSON {
  kind: "PlaceAndMake";
}

export class PlaceAndMake {
  static readonly discriminator = 1;
  static readonly kind = "PlaceAndMake";
  readonly discriminator = 1;
  readonly kind = "PlaceAndMake";

  toJSON(): PlaceAndMakeJSON {
    return {
      kind: "PlaceAndMake",
    };
  }

  toEncodable() {
    return {
      PlaceAndMake: {},
    };
  }
}

export interface PlaceAndTakeJSON {
  kind: "PlaceAndTake";
}

export class PlaceAndTake {
  static readonly discriminator = 2;
  static readonly kind = "PlaceAndTake";
  readonly discriminator = 2;
  readonly kind = "PlaceAndTake";

  toJSON(): PlaceAndTakeJSON {
    return {
      kind: "PlaceAndTake",
    };
  }

  toEncodable() {
    return {
      PlaceAndTake: {},
    };
  }
}

export interface LiquidationJSON {
  kind: "Liquidation";
}

export class Liquidation {
  static readonly discriminator = 3;
  static readonly kind = "Liquidation";
  readonly discriminator = 3;
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
export function fromDecoded(obj: any): types.FillModeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Fill" in obj) {
    return new Fill();
  }
  if ("PlaceAndMake" in obj) {
    return new PlaceAndMake();
  }
  if ("PlaceAndTake" in obj) {
    return new PlaceAndTake();
  }
  if ("Liquidation" in obj) {
    return new Liquidation();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.FillModeJSON): types.FillModeKind {
  switch (obj.kind) {
    case "Fill": {
      return new Fill();
    }
    case "PlaceAndMake": {
      return new PlaceAndMake();
    }
    case "PlaceAndTake": {
      return new PlaceAndTake();
    }
    case "Liquidation": {
      return new Liquidation();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Fill"),
    borsh.struct([], "PlaceAndMake"),
    borsh.struct([], "PlaceAndTake"),
    borsh.struct([], "Liquidation"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
