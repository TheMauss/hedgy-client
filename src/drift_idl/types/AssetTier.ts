import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface CollateralJSON {
  kind: "Collateral";
}

export class Collateral {
  static readonly discriminator = 0;
  static readonly kind = "Collateral";
  readonly discriminator = 0;
  readonly kind = "Collateral";

  toJSON(): CollateralJSON {
    return {
      kind: "Collateral",
    };
  }

  toEncodable() {
    return {
      Collateral: {},
    };
  }
}

export interface ProtectedJSON {
  kind: "Protected";
}

export class Protected {
  static readonly discriminator = 1;
  static readonly kind = "Protected";
  readonly discriminator = 1;
  readonly kind = "Protected";

  toJSON(): ProtectedJSON {
    return {
      kind: "Protected",
    };
  }

  toEncodable() {
    return {
      Protected: {},
    };
  }
}

export interface CrossJSON {
  kind: "Cross";
}

export class Cross {
  static readonly discriminator = 2;
  static readonly kind = "Cross";
  readonly discriminator = 2;
  readonly kind = "Cross";

  toJSON(): CrossJSON {
    return {
      kind: "Cross",
    };
  }

  toEncodable() {
    return {
      Cross: {},
    };
  }
}

export interface IsolatedJSON {
  kind: "Isolated";
}

export class Isolated {
  static readonly discriminator = 3;
  static readonly kind = "Isolated";
  readonly discriminator = 3;
  readonly kind = "Isolated";

  toJSON(): IsolatedJSON {
    return {
      kind: "Isolated",
    };
  }

  toEncodable() {
    return {
      Isolated: {},
    };
  }
}

export interface UnlistedJSON {
  kind: "Unlisted";
}

export class Unlisted {
  static readonly discriminator = 4;
  static readonly kind = "Unlisted";
  readonly discriminator = 4;
  readonly kind = "Unlisted";

  toJSON(): UnlistedJSON {
    return {
      kind: "Unlisted",
    };
  }

  toEncodable() {
    return {
      Unlisted: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.AssetTierKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Collateral" in obj) {
    return new Collateral();
  }
  if ("Protected" in obj) {
    return new Protected();
  }
  if ("Cross" in obj) {
    return new Cross();
  }
  if ("Isolated" in obj) {
    return new Isolated();
  }
  if ("Unlisted" in obj) {
    return new Unlisted();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.AssetTierJSON): types.AssetTierKind {
  switch (obj.kind) {
    case "Collateral": {
      return new Collateral();
    }
    case "Protected": {
      return new Protected();
    }
    case "Cross": {
      return new Cross();
    }
    case "Isolated": {
      return new Isolated();
    }
    case "Unlisted": {
      return new Unlisted();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Collateral"),
    borsh.struct([], "Protected"),
    borsh.struct([], "Cross"),
    borsh.struct([], "Isolated"),
    borsh.struct([], "Unlisted"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
