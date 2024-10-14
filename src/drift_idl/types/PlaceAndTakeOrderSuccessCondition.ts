import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface PartialFillJSON {
  kind: "PartialFill";
}

export class PartialFill {
  static readonly discriminator = 0;
  static readonly kind = "PartialFill";
  readonly discriminator = 0;
  readonly kind = "PartialFill";

  toJSON(): PartialFillJSON {
    return {
      kind: "PartialFill",
    };
  }

  toEncodable() {
    return {
      PartialFill: {},
    };
  }
}

export interface FullFillJSON {
  kind: "FullFill";
}

export class FullFill {
  static readonly discriminator = 1;
  static readonly kind = "FullFill";
  readonly discriminator = 1;
  readonly kind = "FullFill";

  toJSON(): FullFillJSON {
    return {
      kind: "FullFill",
    };
  }

  toEncodable() {
    return {
      FullFill: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(
  obj: any
): types.PlaceAndTakeOrderSuccessConditionKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("PartialFill" in obj) {
    return new PartialFill();
  }
  if ("FullFill" in obj) {
    return new FullFill();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.PlaceAndTakeOrderSuccessConditionJSON
): types.PlaceAndTakeOrderSuccessConditionKind {
  switch (obj.kind) {
    case "PartialFill": {
      return new PartialFill();
    }
    case "FullFill": {
      return new FullFill();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "PartialFill"),
    borsh.struct([], "FullFill"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
