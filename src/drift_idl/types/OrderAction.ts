import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface PlaceJSON {
  kind: "Place";
}

export class Place {
  static readonly discriminator = 0;
  static readonly kind = "Place";
  readonly discriminator = 0;
  readonly kind = "Place";

  toJSON(): PlaceJSON {
    return {
      kind: "Place",
    };
  }

  toEncodable() {
    return {
      Place: {},
    };
  }
}

export interface CancelJSON {
  kind: "Cancel";
}

export class Cancel {
  static readonly discriminator = 1;
  static readonly kind = "Cancel";
  readonly discriminator = 1;
  readonly kind = "Cancel";

  toJSON(): CancelJSON {
    return {
      kind: "Cancel",
    };
  }

  toEncodable() {
    return {
      Cancel: {},
    };
  }
}

export interface FillJSON {
  kind: "Fill";
}

export class Fill {
  static readonly discriminator = 2;
  static readonly kind = "Fill";
  readonly discriminator = 2;
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

export interface TriggerJSON {
  kind: "Trigger";
}

export class Trigger {
  static readonly discriminator = 3;
  static readonly kind = "Trigger";
  readonly discriminator = 3;
  readonly kind = "Trigger";

  toJSON(): TriggerJSON {
    return {
      kind: "Trigger",
    };
  }

  toEncodable() {
    return {
      Trigger: {},
    };
  }
}

export interface ExpireJSON {
  kind: "Expire";
}

export class Expire {
  static readonly discriminator = 4;
  static readonly kind = "Expire";
  readonly discriminator = 4;
  readonly kind = "Expire";

  toJSON(): ExpireJSON {
    return {
      kind: "Expire",
    };
  }

  toEncodable() {
    return {
      Expire: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.OrderActionKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Place" in obj) {
    return new Place();
  }
  if ("Cancel" in obj) {
    return new Cancel();
  }
  if ("Fill" in obj) {
    return new Fill();
  }
  if ("Trigger" in obj) {
    return new Trigger();
  }
  if ("Expire" in obj) {
    return new Expire();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.OrderActionJSON): types.OrderActionKind {
  switch (obj.kind) {
    case "Place": {
      return new Place();
    }
    case "Cancel": {
      return new Cancel();
    }
    case "Fill": {
      return new Fill();
    }
    case "Trigger": {
      return new Trigger();
    }
    case "Expire": {
      return new Expire();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Place"),
    borsh.struct([], "Cancel"),
    borsh.struct([], "Fill"),
    borsh.struct([], "Trigger"),
    borsh.struct([], "Expire"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
