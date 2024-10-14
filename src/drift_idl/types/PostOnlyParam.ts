import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface NoneJSON {
  kind: "None";
}

export class None {
  static readonly discriminator = 0;
  static readonly kind = "None";
  readonly discriminator = 0;
  readonly kind = "None";

  toJSON(): NoneJSON {
    return {
      kind: "None",
    };
  }

  toEncodable() {
    return {
      None: {},
    };
  }
}

export interface MustPostOnlyJSON {
  kind: "MustPostOnly";
}

export class MustPostOnly {
  static readonly discriminator = 1;
  static readonly kind = "MustPostOnly";
  readonly discriminator = 1;
  readonly kind = "MustPostOnly";

  toJSON(): MustPostOnlyJSON {
    return {
      kind: "MustPostOnly",
    };
  }

  toEncodable() {
    return {
      MustPostOnly: {},
    };
  }
}

export interface TryPostOnlyJSON {
  kind: "TryPostOnly";
}

export class TryPostOnly {
  static readonly discriminator = 2;
  static readonly kind = "TryPostOnly";
  readonly discriminator = 2;
  readonly kind = "TryPostOnly";

  toJSON(): TryPostOnlyJSON {
    return {
      kind: "TryPostOnly",
    };
  }

  toEncodable() {
    return {
      TryPostOnly: {},
    };
  }
}

export interface SlideJSON {
  kind: "Slide";
}

export class Slide {
  static readonly discriminator = 3;
  static readonly kind = "Slide";
  readonly discriminator = 3;
  readonly kind = "Slide";

  toJSON(): SlideJSON {
    return {
      kind: "Slide",
    };
  }

  toEncodable() {
    return {
      Slide: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.PostOnlyParamKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("None" in obj) {
    return new None();
  }
  if ("MustPostOnly" in obj) {
    return new MustPostOnly();
  }
  if ("TryPostOnly" in obj) {
    return new TryPostOnly();
  }
  if ("Slide" in obj) {
    return new Slide();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.PostOnlyParamJSON
): types.PostOnlyParamKind {
  switch (obj.kind) {
    case "None": {
      return new None();
    }
    case "MustPostOnly": {
      return new MustPostOnly();
    }
    case "TryPostOnly": {
      return new TryPostOnly();
    }
    case "Slide": {
      return new Slide();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "None"),
    borsh.struct([], "MustPostOnly"),
    borsh.struct([], "TryPostOnly"),
    borsh.struct([], "Slide"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
