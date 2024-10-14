import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface MarketJSON {
  kind: "Market";
}

export class Market {
  static readonly discriminator = 0;
  static readonly kind = "Market";
  readonly discriminator = 0;
  readonly kind = "Market";

  toJSON(): MarketJSON {
    return {
      kind: "Market",
    };
  }

  toEncodable() {
    return {
      Market: {},
    };
  }
}

export interface LimitJSON {
  kind: "Limit";
}

export class Limit {
  static readonly discriminator = 1;
  static readonly kind = "Limit";
  readonly discriminator = 1;
  readonly kind = "Limit";

  toJSON(): LimitJSON {
    return {
      kind: "Limit",
    };
  }

  toEncodable() {
    return {
      Limit: {},
    };
  }
}

export interface TriggerMarketJSON {
  kind: "TriggerMarket";
}

export class TriggerMarket {
  static readonly discriminator = 2;
  static readonly kind = "TriggerMarket";
  readonly discriminator = 2;
  readonly kind = "TriggerMarket";

  toJSON(): TriggerMarketJSON {
    return {
      kind: "TriggerMarket",
    };
  }

  toEncodable() {
    return {
      TriggerMarket: {},
    };
  }
}

export interface TriggerLimitJSON {
  kind: "TriggerLimit";
}

export class TriggerLimit {
  static readonly discriminator = 3;
  static readonly kind = "TriggerLimit";
  readonly discriminator = 3;
  readonly kind = "TriggerLimit";

  toJSON(): TriggerLimitJSON {
    return {
      kind: "TriggerLimit",
    };
  }

  toEncodable() {
    return {
      TriggerLimit: {},
    };
  }
}

export interface OracleJSON {
  kind: "Oracle";
}

export class Oracle {
  static readonly discriminator = 4;
  static readonly kind = "Oracle";
  readonly discriminator = 4;
  readonly kind = "Oracle";

  toJSON(): OracleJSON {
    return {
      kind: "Oracle",
    };
  }

  toEncodable() {
    return {
      Oracle: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.OrderTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Market" in obj) {
    return new Market();
  }
  if ("Limit" in obj) {
    return new Limit();
  }
  if ("TriggerMarket" in obj) {
    return new TriggerMarket();
  }
  if ("TriggerLimit" in obj) {
    return new TriggerLimit();
  }
  if ("Oracle" in obj) {
    return new Oracle();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.OrderTypeJSON): types.OrderTypeKind {
  switch (obj.kind) {
    case "Market": {
      return new Market();
    }
    case "Limit": {
      return new Limit();
    }
    case "TriggerMarket": {
      return new TriggerMarket();
    }
    case "TriggerLimit": {
      return new TriggerLimit();
    }
    case "Oracle": {
      return new Oracle();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Market"),
    borsh.struct([], "Limit"),
    borsh.struct([], "TriggerMarket"),
    borsh.struct([], "TriggerLimit"),
    borsh.struct([], "Oracle"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
