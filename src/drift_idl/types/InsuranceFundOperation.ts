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

export interface AddJSON {
  kind: "Add";
}

export class Add {
  static readonly discriminator = 1;
  static readonly kind = "Add";
  readonly discriminator = 1;
  readonly kind = "Add";

  toJSON(): AddJSON {
    return {
      kind: "Add",
    };
  }

  toEncodable() {
    return {
      Add: {},
    };
  }
}

export interface RequestRemoveJSON {
  kind: "RequestRemove";
}

export class RequestRemove {
  static readonly discriminator = 2;
  static readonly kind = "RequestRemove";
  readonly discriminator = 2;
  readonly kind = "RequestRemove";

  toJSON(): RequestRemoveJSON {
    return {
      kind: "RequestRemove",
    };
  }

  toEncodable() {
    return {
      RequestRemove: {},
    };
  }
}

export interface RemoveJSON {
  kind: "Remove";
}

export class Remove {
  static readonly discriminator = 3;
  static readonly kind = "Remove";
  readonly discriminator = 3;
  readonly kind = "Remove";

  toJSON(): RemoveJSON {
    return {
      kind: "Remove",
    };
  }

  toEncodable() {
    return {
      Remove: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.InsuranceFundOperationKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Init" in obj) {
    return new Init();
  }
  if ("Add" in obj) {
    return new Add();
  }
  if ("RequestRemove" in obj) {
    return new RequestRemove();
  }
  if ("Remove" in obj) {
    return new Remove();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.InsuranceFundOperationJSON
): types.InsuranceFundOperationKind {
  switch (obj.kind) {
    case "Init": {
      return new Init();
    }
    case "Add": {
      return new Add();
    }
    case "RequestRemove": {
      return new RequestRemove();
    }
    case "Remove": {
      return new Remove();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Init"),
    borsh.struct([], "Add"),
    borsh.struct([], "RequestRemove"),
    borsh.struct([], "Remove"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
