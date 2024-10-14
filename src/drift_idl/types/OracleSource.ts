import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface PythJSON {
  kind: "Pyth";
}

export class Pyth {
  static readonly discriminator = 0;
  static readonly kind = "Pyth";
  readonly discriminator = 0;
  readonly kind = "Pyth";

  toJSON(): PythJSON {
    return {
      kind: "Pyth",
    };
  }

  toEncodable() {
    return {
      Pyth: {},
    };
  }
}

export interface SwitchboardJSON {
  kind: "Switchboard";
}

export class Switchboard {
  static readonly discriminator = 1;
  static readonly kind = "Switchboard";
  readonly discriminator = 1;
  readonly kind = "Switchboard";

  toJSON(): SwitchboardJSON {
    return {
      kind: "Switchboard",
    };
  }

  toEncodable() {
    return {
      Switchboard: {},
    };
  }
}

export interface QuoteAssetJSON {
  kind: "QuoteAsset";
}

export class QuoteAsset {
  static readonly discriminator = 2;
  static readonly kind = "QuoteAsset";
  readonly discriminator = 2;
  readonly kind = "QuoteAsset";

  toJSON(): QuoteAssetJSON {
    return {
      kind: "QuoteAsset",
    };
  }

  toEncodable() {
    return {
      QuoteAsset: {},
    };
  }
}

export interface Pyth1KJSON {
  kind: "Pyth1K";
}

export class Pyth1K {
  static readonly discriminator = 3;
  static readonly kind = "Pyth1K";
  readonly discriminator = 3;
  readonly kind = "Pyth1K";

  toJSON(): Pyth1KJSON {
    return {
      kind: "Pyth1K",
    };
  }

  toEncodable() {
    return {
      Pyth1K: {},
    };
  }
}

export interface Pyth1MJSON {
  kind: "Pyth1M";
}

export class Pyth1M {
  static readonly discriminator = 4;
  static readonly kind = "Pyth1M";
  readonly discriminator = 4;
  readonly kind = "Pyth1M";

  toJSON(): Pyth1MJSON {
    return {
      kind: "Pyth1M",
    };
  }

  toEncodable() {
    return {
      Pyth1M: {},
    };
  }
}

export interface PythStableCoinJSON {
  kind: "PythStableCoin";
}

export class PythStableCoin {
  static readonly discriminator = 5;
  static readonly kind = "PythStableCoin";
  readonly discriminator = 5;
  readonly kind = "PythStableCoin";

  toJSON(): PythStableCoinJSON {
    return {
      kind: "PythStableCoin",
    };
  }

  toEncodable() {
    return {
      PythStableCoin: {},
    };
  }
}

export interface PrelaunchJSON {
  kind: "Prelaunch";
}

export class Prelaunch {
  static readonly discriminator = 6;
  static readonly kind = "Prelaunch";
  readonly discriminator = 6;
  readonly kind = "Prelaunch";

  toJSON(): PrelaunchJSON {
    return {
      kind: "Prelaunch",
    };
  }

  toEncodable() {
    return {
      Prelaunch: {},
    };
  }
}

export interface PythPullJSON {
  kind: "PythPull";
}

export class PythPull {
  static readonly discriminator = 7;
  static readonly kind = "PythPull";
  readonly discriminator = 7;
  readonly kind = "PythPull";

  toJSON(): PythPullJSON {
    return {
      kind: "PythPull",
    };
  }

  toEncodable() {
    return {
      PythPull: {},
    };
  }
}

export interface Pyth1KPullJSON {
  kind: "Pyth1KPull";
}

export class Pyth1KPull {
  static readonly discriminator = 8;
  static readonly kind = "Pyth1KPull";
  readonly discriminator = 8;
  readonly kind = "Pyth1KPull";

  toJSON(): Pyth1KPullJSON {
    return {
      kind: "Pyth1KPull",
    };
  }

  toEncodable() {
    return {
      Pyth1KPull: {},
    };
  }
}

export interface Pyth1MPullJSON {
  kind: "Pyth1MPull";
}

export class Pyth1MPull {
  static readonly discriminator = 9;
  static readonly kind = "Pyth1MPull";
  readonly discriminator = 9;
  readonly kind = "Pyth1MPull";

  toJSON(): Pyth1MPullJSON {
    return {
      kind: "Pyth1MPull",
    };
  }

  toEncodable() {
    return {
      Pyth1MPull: {},
    };
  }
}

export interface PythStableCoinPullJSON {
  kind: "PythStableCoinPull";
}

export class PythStableCoinPull {
  static readonly discriminator = 10;
  static readonly kind = "PythStableCoinPull";
  readonly discriminator = 10;
  readonly kind = "PythStableCoinPull";

  toJSON(): PythStableCoinPullJSON {
    return {
      kind: "PythStableCoinPull",
    };
  }

  toEncodable() {
    return {
      PythStableCoinPull: {},
    };
  }
}

export interface SwitchboardOnDemandJSON {
  kind: "SwitchboardOnDemand";
}

export class SwitchboardOnDemand {
  static readonly discriminator = 11;
  static readonly kind = "SwitchboardOnDemand";
  readonly discriminator = 11;
  readonly kind = "SwitchboardOnDemand";

  toJSON(): SwitchboardOnDemandJSON {
    return {
      kind: "SwitchboardOnDemand",
    };
  }

  toEncodable() {
    return {
      SwitchboardOnDemand: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.OracleSourceKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Pyth" in obj) {
    return new Pyth();
  }
  if ("Switchboard" in obj) {
    return new Switchboard();
  }
  if ("QuoteAsset" in obj) {
    return new QuoteAsset();
  }
  if ("Pyth1K" in obj) {
    return new Pyth1K();
  }
  if ("Pyth1M" in obj) {
    return new Pyth1M();
  }
  if ("PythStableCoin" in obj) {
    return new PythStableCoin();
  }
  if ("Prelaunch" in obj) {
    return new Prelaunch();
  }
  if ("PythPull" in obj) {
    return new PythPull();
  }
  if ("Pyth1KPull" in obj) {
    return new Pyth1KPull();
  }
  if ("Pyth1MPull" in obj) {
    return new Pyth1MPull();
  }
  if ("PythStableCoinPull" in obj) {
    return new PythStableCoinPull();
  }
  if ("SwitchboardOnDemand" in obj) {
    return new SwitchboardOnDemand();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.OracleSourceJSON): types.OracleSourceKind {
  switch (obj.kind) {
    case "Pyth": {
      return new Pyth();
    }
    case "Switchboard": {
      return new Switchboard();
    }
    case "QuoteAsset": {
      return new QuoteAsset();
    }
    case "Pyth1K": {
      return new Pyth1K();
    }
    case "Pyth1M": {
      return new Pyth1M();
    }
    case "PythStableCoin": {
      return new PythStableCoin();
    }
    case "Prelaunch": {
      return new Prelaunch();
    }
    case "PythPull": {
      return new PythPull();
    }
    case "Pyth1KPull": {
      return new Pyth1KPull();
    }
    case "Pyth1MPull": {
      return new Pyth1MPull();
    }
    case "PythStableCoinPull": {
      return new PythStableCoinPull();
    }
    case "SwitchboardOnDemand": {
      return new SwitchboardOnDemand();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Pyth"),
    borsh.struct([], "Switchboard"),
    borsh.struct([], "QuoteAsset"),
    borsh.struct([], "Pyth1K"),
    borsh.struct([], "Pyth1M"),
    borsh.struct([], "PythStableCoin"),
    borsh.struct([], "Prelaunch"),
    borsh.struct([], "PythPull"),
    borsh.struct([], "Pyth1KPull"),
    borsh.struct([], "Pyth1MPull"),
    borsh.struct([], "PythStableCoinPull"),
    borsh.struct([], "SwitchboardOnDemand"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
