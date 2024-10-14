import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface StakeJSON {
  kind: "Stake";
}

export class Stake {
  static readonly discriminator = 0;
  static readonly kind = "Stake";
  readonly discriminator = 0;
  readonly kind = "Stake";

  toJSON(): StakeJSON {
    return {
      kind: "Stake",
    };
  }

  toEncodable() {
    return {
      Stake: {},
    };
  }
}

export interface UnstakeRequestJSON {
  kind: "UnstakeRequest";
}

export class UnstakeRequest {
  static readonly discriminator = 1;
  static readonly kind = "UnstakeRequest";
  readonly discriminator = 1;
  readonly kind = "UnstakeRequest";

  toJSON(): UnstakeRequestJSON {
    return {
      kind: "UnstakeRequest",
    };
  }

  toEncodable() {
    return {
      UnstakeRequest: {},
    };
  }
}

export interface UnstakeCancelRequestJSON {
  kind: "UnstakeCancelRequest";
}

export class UnstakeCancelRequest {
  static readonly discriminator = 2;
  static readonly kind = "UnstakeCancelRequest";
  readonly discriminator = 2;
  readonly kind = "UnstakeCancelRequest";

  toJSON(): UnstakeCancelRequestJSON {
    return {
      kind: "UnstakeCancelRequest",
    };
  }

  toEncodable() {
    return {
      UnstakeCancelRequest: {},
    };
  }
}

export interface UnstakeJSON {
  kind: "Unstake";
}

export class Unstake {
  static readonly discriminator = 3;
  static readonly kind = "Unstake";
  readonly discriminator = 3;
  readonly kind = "Unstake";

  toJSON(): UnstakeJSON {
    return {
      kind: "Unstake",
    };
  }

  toEncodable() {
    return {
      Unstake: {},
    };
  }
}

export interface UnstakeTransferJSON {
  kind: "UnstakeTransfer";
}

export class UnstakeTransfer {
  static readonly discriminator = 4;
  static readonly kind = "UnstakeTransfer";
  readonly discriminator = 4;
  readonly kind = "UnstakeTransfer";

  toJSON(): UnstakeTransferJSON {
    return {
      kind: "UnstakeTransfer",
    };
  }

  toEncodable() {
    return {
      UnstakeTransfer: {},
    };
  }
}

export interface StakeTransferJSON {
  kind: "StakeTransfer";
}

export class StakeTransfer {
  static readonly discriminator = 5;
  static readonly kind = "StakeTransfer";
  readonly discriminator = 5;
  readonly kind = "StakeTransfer";

  toJSON(): StakeTransferJSON {
    return {
      kind: "StakeTransfer",
    };
  }

  toEncodable() {
    return {
      StakeTransfer: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.StakeActionKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Stake" in obj) {
    return new Stake();
  }
  if ("UnstakeRequest" in obj) {
    return new UnstakeRequest();
  }
  if ("UnstakeCancelRequest" in obj) {
    return new UnstakeCancelRequest();
  }
  if ("Unstake" in obj) {
    return new Unstake();
  }
  if ("UnstakeTransfer" in obj) {
    return new UnstakeTransfer();
  }
  if ("StakeTransfer" in obj) {
    return new StakeTransfer();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(obj: types.StakeActionJSON): types.StakeActionKind {
  switch (obj.kind) {
    case "Stake": {
      return new Stake();
    }
    case "UnstakeRequest": {
      return new UnstakeRequest();
    }
    case "UnstakeCancelRequest": {
      return new UnstakeCancelRequest();
    }
    case "Unstake": {
      return new Unstake();
    }
    case "UnstakeTransfer": {
      return new UnstakeTransfer();
    }
    case "StakeTransfer": {
      return new StakeTransfer();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Stake"),
    borsh.struct([], "UnstakeRequest"),
    borsh.struct([], "UnstakeCancelRequest"),
    borsh.struct([], "Unstake"),
    borsh.struct([], "UnstakeTransfer"),
    borsh.struct([], "StakeTransfer"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
