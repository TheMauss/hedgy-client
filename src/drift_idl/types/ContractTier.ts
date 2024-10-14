import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface AJSON {
  kind: "A";
}

export class A {
  static readonly discriminator = 0;
  static readonly kind = "A";
  readonly discriminator = 0;
  readonly kind = "A";

  toJSON(): AJSON {
    return {
      kind: "A",
    };
  }

  toEncodable() {
    return {
      A: {},
    };
  }
}

export interface BJSON {
  kind: "B";
}

export class B {
  static readonly discriminator = 1;
  static readonly kind = "B";
  readonly discriminator = 1;
  readonly kind = "B";

  toJSON(): BJSON {
    return {
      kind: "B",
    };
  }

  toEncodable() {
    return {
      B: {},
    };
  }
}

export interface CJSON {
  kind: "C";
}

export class C {
  static readonly discriminator = 2;
  static readonly kind = "C";
  readonly discriminator = 2;
  readonly kind = "C";

  toJSON(): CJSON {
    return {
      kind: "C",
    };
  }

  toEncodable() {
    return {
      C: {},
    };
  }
}

export interface SpeculativeJSON {
  kind: "Speculative";
}

export class Speculative {
  static readonly discriminator = 3;
  static readonly kind = "Speculative";
  readonly discriminator = 3;
  readonly kind = "Speculative";

  toJSON(): SpeculativeJSON {
    return {
      kind: "Speculative",
    };
  }

  toEncodable() {
    return {
      Speculative: {},
    };
  }
}

export interface HighlySpeculativeJSON {
  kind: "HighlySpeculative";
}

export class HighlySpeculative {
  static readonly discriminator = 4;
  static readonly kind = "HighlySpeculative";
  readonly discriminator = 4;
  readonly kind = "HighlySpeculative";

  toJSON(): HighlySpeculativeJSON {
    return {
      kind: "HighlySpeculative",
    };
  }

  toEncodable() {
    return {
      HighlySpeculative: {},
    };
  }
}

export interface IsolatedJSON {
  kind: "Isolated";
}

export class Isolated {
  static readonly discriminator = 5;
  static readonly kind = "Isolated";
  readonly discriminator = 5;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.ContractTierKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("A" in obj) {
    return new A();
  }
  if ("B" in obj) {
    return new B();
  }
  if ("C" in obj) {
    return new C();
  }
  if ("Speculative" in obj) {
    return new Speculative();
  }
  if ("HighlySpeculative" in obj) {
    return new HighlySpeculative();
  }
  if ("Isolated" in obj) {
    return new Isolated();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.ContractTierJSON): types.ContractTierKind {
  switch (obj.kind) {
    case "A": {
      return new A();
    }
    case "B": {
      return new B();
    }
    case "C": {
      return new C();
    }
    case "Speculative": {
      return new Speculative();
    }
    case "HighlySpeculative": {
      return new HighlySpeculative();
    }
    case "Isolated": {
      return new Isolated();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "A"),
    borsh.struct([], "B"),
    borsh.struct([], "C"),
    borsh.struct([], "Speculative"),
    borsh.struct([], "HighlySpeculative"),
    borsh.struct([], "Isolated"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
