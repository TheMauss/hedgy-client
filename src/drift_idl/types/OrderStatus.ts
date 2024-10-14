import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface InitJSON {
  kind: "Init";
}

export class Init {
  static readonly discriminator = 0;
  static readonly kind = "Init";
  readonly discriminator = 0;
  readonly kind = "Init";

  toJSON(): InitJSON {
    return {
      kind: "Init",
    };
  }

  toEncodable() {
    return {
      Init: {},
    };
  }
}

export interface OpenJSON {
  kind: "Open";
}

export class Open {
  static readonly discriminator = 1;
  static readonly kind = "Open";
  readonly discriminator = 1;
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

export interface FilledJSON {
  kind: "Filled";
}

export class Filled {
  static readonly discriminator = 2;
  static readonly kind = "Filled";
  readonly discriminator = 2;
  readonly kind = "Filled";

  toJSON(): FilledJSON {
    return {
      kind: "Filled",
    };
  }

  toEncodable() {
    return {
      Filled: {},
    };
  }
}

export interface CanceledJSON {
  kind: "Canceled";
}

export class Canceled {
  static readonly discriminator = 3;
  static readonly kind = "Canceled";
  readonly discriminator = 3;
  readonly kind = "Canceled";

  toJSON(): CanceledJSON {
    return {
      kind: "Canceled",
    };
  }

  toEncodable() {
    return {
      Canceled: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.OrderStatusKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Init" in obj) {
    return new Init();
  }
  if ("Open" in obj) {
    return new Open();
  }
  if ("Filled" in obj) {
    return new Filled();
  }
  if ("Canceled" in obj) {
    return new Canceled();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.OrderStatusJSON): types.OrderStatusKind {
  switch (obj.kind) {
    case "Init": {
      return new Init();
    }
    case "Open": {
      return new Open();
    }
    case "Filled": {
      return new Filled();
    }
    case "Canceled": {
      return new Canceled();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Init"),
    borsh.struct([], "Open"),
    borsh.struct([], "Filled"),
    borsh.struct([], "Canceled"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
