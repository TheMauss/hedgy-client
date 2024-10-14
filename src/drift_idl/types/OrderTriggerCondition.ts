import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface AboveJSON {
  kind: "Above";
}

export class Above {
  static readonly discriminator = 0;
  static readonly kind = "Above";
  readonly discriminator = 0;
  readonly kind = "Above";

  toJSON(): AboveJSON {
    return {
      kind: "Above",
    };
  }

  toEncodable() {
    return {
      Above: {},
    };
  }
}

export interface BelowJSON {
  kind: "Below";
}

export class Below {
  static readonly discriminator = 1;
  static readonly kind = "Below";
  readonly discriminator = 1;
  readonly kind = "Below";

  toJSON(): BelowJSON {
    return {
      kind: "Below",
    };
  }

  toEncodable() {
    return {
      Below: {},
    };
  }
}

export interface TriggeredAboveJSON {
  kind: "TriggeredAbove";
}

export class TriggeredAbove {
  static readonly discriminator = 2;
  static readonly kind = "TriggeredAbove";
  readonly discriminator = 2;
  readonly kind = "TriggeredAbove";

  toJSON(): TriggeredAboveJSON {
    return {
      kind: "TriggeredAbove",
    };
  }

  toEncodable() {
    return {
      TriggeredAbove: {},
    };
  }
}

export interface TriggeredBelowJSON {
  kind: "TriggeredBelow";
}

export class TriggeredBelow {
  static readonly discriminator = 3;
  static readonly kind = "TriggeredBelow";
  readonly discriminator = 3;
  readonly kind = "TriggeredBelow";

  toJSON(): TriggeredBelowJSON {
    return {
      kind: "TriggeredBelow",
    };
  }

  toEncodable() {
    return {
      TriggeredBelow: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.OrderTriggerConditionKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Above" in obj) {
    return new Above();
  }
  if ("Below" in obj) {
    return new Below();
  }
  if ("TriggeredAbove" in obj) {
    return new TriggeredAbove();
  }
  if ("TriggeredBelow" in obj) {
    return new TriggeredBelow();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.OrderTriggerConditionJSON
): types.OrderTriggerConditionKind {
  switch (obj.kind) {
    case "Above": {
      return new Above();
    }
    case "Below": {
      return new Below();
    }
    case "TriggeredAbove": {
      return new TriggeredAbove();
    }
    case "TriggeredBelow": {
      return new TriggeredBelow();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Above"),
    borsh.struct([], "Below"),
    borsh.struct([], "TriggeredAbove"),
    borsh.struct([], "TriggeredBelow"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
