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

export interface TransferJSON {
  kind: "Transfer";
}

export class Transfer {
  static readonly discriminator = 1;
  static readonly kind = "Transfer";
  readonly discriminator = 1;
  readonly kind = "Transfer";

  toJSON(): TransferJSON {
    return {
      kind: "Transfer",
    };
  }

  toEncodable() {
    return {
      Transfer: {},
    };
  }
}

export interface BorrowJSON {
  kind: "Borrow";
}

export class Borrow {
  static readonly discriminator = 2;
  static readonly kind = "Borrow";
  readonly discriminator = 2;
  readonly kind = "Borrow";

  toJSON(): BorrowJSON {
    return {
      kind: "Borrow",
    };
  }

  toEncodable() {
    return {
      Borrow: {},
    };
  }
}

export interface RepayBorrowJSON {
  kind: "RepayBorrow";
}

export class RepayBorrow {
  static readonly discriminator = 3;
  static readonly kind = "RepayBorrow";
  readonly discriminator = 3;
  readonly kind = "RepayBorrow";

  toJSON(): RepayBorrowJSON {
    return {
      kind: "RepayBorrow",
    };
  }

  toEncodable() {
    return {
      RepayBorrow: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.DepositExplanationKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("None" in obj) {
    return new None();
  }
  if ("Transfer" in obj) {
    return new Transfer();
  }
  if ("Borrow" in obj) {
    return new Borrow();
  }
  if ("RepayBorrow" in obj) {
    return new RepayBorrow();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.DepositExplanationJSON
): types.DepositExplanationKind {
  switch (obj.kind) {
    case "None": {
      return new None();
    }
    case "Transfer": {
      return new Transfer();
    }
    case "Borrow": {
      return new Borrow();
    }
    case "RepayBorrow": {
      return new RepayBorrow();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "None"),
    borsh.struct([], "Transfer"),
    borsh.struct([], "Borrow"),
    borsh.struct([], "RepayBorrow"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
