import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface NonPositiveJSON {
  kind: "NonPositive";
}

export class NonPositive {
  static readonly discriminator = 0;
  static readonly kind = "NonPositive";
  readonly discriminator = 0;
  readonly kind = "NonPositive";

  toJSON(): NonPositiveJSON {
    return {
      kind: "NonPositive",
    };
  }

  toEncodable() {
    return {
      NonPositive: {},
    };
  }
}

export interface TooVolatileJSON {
  kind: "TooVolatile";
}

export class TooVolatile {
  static readonly discriminator = 1;
  static readonly kind = "TooVolatile";
  readonly discriminator = 1;
  readonly kind = "TooVolatile";

  toJSON(): TooVolatileJSON {
    return {
      kind: "TooVolatile",
    };
  }

  toEncodable() {
    return {
      TooVolatile: {},
    };
  }
}

export interface TooUncertainJSON {
  kind: "TooUncertain";
}

export class TooUncertain {
  static readonly discriminator = 2;
  static readonly kind = "TooUncertain";
  readonly discriminator = 2;
  readonly kind = "TooUncertain";

  toJSON(): TooUncertainJSON {
    return {
      kind: "TooUncertain",
    };
  }

  toEncodable() {
    return {
      TooUncertain: {},
    };
  }
}

export interface StaleForMarginJSON {
  kind: "StaleForMargin";
}

export class StaleForMargin {
  static readonly discriminator = 3;
  static readonly kind = "StaleForMargin";
  readonly discriminator = 3;
  readonly kind = "StaleForMargin";

  toJSON(): StaleForMarginJSON {
    return {
      kind: "StaleForMargin",
    };
  }

  toEncodable() {
    return {
      StaleForMargin: {},
    };
  }
}

export interface InsufficientDataPointsJSON {
  kind: "InsufficientDataPoints";
}

export class InsufficientDataPoints {
  static readonly discriminator = 4;
  static readonly kind = "InsufficientDataPoints";
  readonly discriminator = 4;
  readonly kind = "InsufficientDataPoints";

  toJSON(): InsufficientDataPointsJSON {
    return {
      kind: "InsufficientDataPoints",
    };
  }

  toEncodable() {
    return {
      InsufficientDataPoints: {},
    };
  }
}

export interface StaleForAMMJSON {
  kind: "StaleForAMM";
}

export class StaleForAMM {
  static readonly discriminator = 5;
  static readonly kind = "StaleForAMM";
  readonly discriminator = 5;
  readonly kind = "StaleForAMM";

  toJSON(): StaleForAMMJSON {
    return {
      kind: "StaleForAMM",
    };
  }

  toEncodable() {
    return {
      StaleForAMM: {},
    };
  }
}

export interface ValidJSON {
  kind: "Valid";
}

export class Valid {
  static readonly discriminator = 6;
  static readonly kind = "Valid";
  readonly discriminator = 6;
  readonly kind = "Valid";

  toJSON(): ValidJSON {
    return {
      kind: "Valid",
    };
  }

  toEncodable() {
    return {
      Valid: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.OracleValidityKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("NonPositive" in obj) {
    return new NonPositive();
  }
  if ("TooVolatile" in obj) {
    return new TooVolatile();
  }
  if ("TooUncertain" in obj) {
    return new TooUncertain();
  }
  if ("StaleForMargin" in obj) {
    return new StaleForMargin();
  }
  if ("InsufficientDataPoints" in obj) {
    return new InsufficientDataPoints();
  }
  if ("StaleForAMM" in obj) {
    return new StaleForAMM();
  }
  if ("Valid" in obj) {
    return new Valid();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.OracleValidityJSON
): types.OracleValidityKind {
  switch (obj.kind) {
    case "NonPositive": {
      return new NonPositive();
    }
    case "TooVolatile": {
      return new TooVolatile();
    }
    case "TooUncertain": {
      return new TooUncertain();
    }
    case "StaleForMargin": {
      return new StaleForMargin();
    }
    case "InsufficientDataPoints": {
      return new InsufficientDataPoints();
    }
    case "StaleForAMM": {
      return new StaleForAMM();
    }
    case "Valid": {
      return new Valid();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "NonPositive"),
    borsh.struct([], "TooVolatile"),
    borsh.struct([], "TooUncertain"),
    borsh.struct([], "StaleForMargin"),
    borsh.struct([], "InsufficientDataPoints"),
    borsh.struct([], "StaleForAMM"),
    borsh.struct([], "Valid"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
