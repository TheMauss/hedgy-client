import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface PerpetualJSON {
  kind: "Perpetual";
}

export class Perpetual {
  static readonly discriminator = 0;
  static readonly kind = "Perpetual";
  readonly discriminator = 0;
  readonly kind = "Perpetual";

  toJSON(): PerpetualJSON {
    return {
      kind: "Perpetual",
    };
  }

  toEncodable() {
    return {
      Perpetual: {},
    };
  }
}

export interface FutureJSON {
  kind: "Future";
}

export class Future {
  static readonly discriminator = 1;
  static readonly kind = "Future";
  readonly discriminator = 1;
  readonly kind = "Future";

  toJSON(): FutureJSON {
    return {
      kind: "Future",
    };
  }

  toEncodable() {
    return {
      Future: {},
    };
  }
}

export interface PredictionJSON {
  kind: "Prediction";
}

export class Prediction {
  static readonly discriminator = 2;
  static readonly kind = "Prediction";
  readonly discriminator = 2;
  readonly kind = "Prediction";

  toJSON(): PredictionJSON {
    return {
      kind: "Prediction",
    };
  }

  toEncodable() {
    return {
      Prediction: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.ContractTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Perpetual" in obj) {
    return new Perpetual();
  }
  if ("Future" in obj) {
    return new Future();
  }
  if ("Prediction" in obj) {
    return new Prediction();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.ContractTypeJSON): types.ContractTypeKind {
  switch (obj.kind) {
    case "Perpetual": {
      return new Perpetual();
    }
    case "Future": {
      return new Future();
    }
    case "Prediction": {
      return new Prediction();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Perpetual"),
    borsh.struct([], "Future"),
    borsh.struct([], "Prediction"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
