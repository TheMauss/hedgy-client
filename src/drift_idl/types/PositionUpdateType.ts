import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface OpenJSON {
  kind: "Open";
}

export class Open {
  static readonly discriminator = 0;
  static readonly kind = "Open";
  readonly discriminator = 0;
  readonly kind = "Open";

  toJSON(): OpenJSON {
    return {
      kind: "Open",
    };
  }

  toEncodable() {
    return {
      Open: {},
    };
  }
}

export interface IncreaseJSON {
  kind: "Increase";
}

export class Increase {
  static readonly discriminator = 1;
  static readonly kind = "Increase";
  readonly discriminator = 1;
  readonly kind = "Increase";

  toJSON(): IncreaseJSON {
    return {
      kind: "Increase",
    };
  }

  toEncodable() {
    return {
      Increase: {},
    };
  }
}

export interface ReduceJSON {
  kind: "Reduce";
}

export class Reduce {
  static readonly discriminator = 2;
  static readonly kind = "Reduce";
  readonly discriminator = 2;
  readonly kind = "Reduce";

  toJSON(): ReduceJSON {
    return {
      kind: "Reduce",
    };
  }

  toEncodable() {
    return {
      Reduce: {},
    };
  }
}

export interface CloseJSON {
  kind: "Close";
}

export class Close {
  static readonly discriminator = 3;
  static readonly kind = "Close";
  readonly discriminator = 3;
  readonly kind = "Close";

  toJSON(): CloseJSON {
    return {
      kind: "Close",
    };
  }

  toEncodable() {
    return {
      Close: {},
    };
  }
}

export interface FlipJSON {
  kind: "Flip";
}

export class Flip {
  static readonly discriminator = 4;
  static readonly kind = "Flip";
  readonly discriminator = 4;
  readonly kind = "Flip";

  toJSON(): FlipJSON {
    return {
      kind: "Flip",
    };
  }

  toEncodable() {
    return {
      Flip: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.PositionUpdateTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Open" in obj) {
    return new Open();
  }
  if ("Increase" in obj) {
    return new Increase();
  }
  if ("Reduce" in obj) {
    return new Reduce();
  }
  if ("Close" in obj) {
    return new Close();
  }
  if ("Flip" in obj) {
    return new Flip();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.PositionUpdateTypeJSON
): types.PositionUpdateTypeKind {
  switch (obj.kind) {
    case "Open": {
      return new Open();
    }
    case "Increase": {
      return new Increase();
    }
    case "Reduce": {
      return new Reduce();
    }
    case "Close": {
      return new Close();
    }
    case "Flip": {
      return new Flip();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Open"),
    borsh.struct([], "Increase"),
    borsh.struct([], "Reduce"),
    borsh.struct([], "Close"),
    borsh.struct([], "Flip"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
