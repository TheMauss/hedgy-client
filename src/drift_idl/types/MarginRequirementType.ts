import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface InitialJSON {
  kind: "Initial";
}

export class Initial {
  static readonly discriminator = 0;
  static readonly kind = "Initial";
  readonly discriminator = 0;
  readonly kind = "Initial";

  toJSON(): InitialJSON {
    return {
      kind: "Initial",
    };
  }

  toEncodable() {
    return {
      Initial: {},
    };
  }
}

export interface FillJSON {
  kind: "Fill";
}

export class Fill {
  static readonly discriminator = 1;
  static readonly kind = "Fill";
  readonly discriminator = 1;
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

export interface MaintenanceJSON {
  kind: "Maintenance";
}

export class Maintenance {
  static readonly discriminator = 2;
  static readonly kind = "Maintenance";
  readonly discriminator = 2;
  readonly kind = "Maintenance";

  toJSON(): MaintenanceJSON {
    return {
      kind: "Maintenance",
    };
  }

  toEncodable() {
    return {
      Maintenance: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.MarginRequirementTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Initial" in obj) {
    return new Initial();
  }
  if ("Fill" in obj) {
    return new Fill();
  }
  if ("Maintenance" in obj) {
    return new Maintenance();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.MarginRequirementTypeJSON
): types.MarginRequirementTypeKind {
  switch (obj.kind) {
    case "Initial": {
      return new Initial();
    }
    case "Fill": {
      return new Fill();
    }
    case "Maintenance": {
      return new Maintenance();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Initial"),
    borsh.struct([], "Fill"),
    borsh.struct([], "Maintenance"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
