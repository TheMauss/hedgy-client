import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface DepositJSON {
  kind: "Deposit";
}

export class Deposit {
  static readonly discriminator = 0;
  static readonly kind = "Deposit";
  readonly discriminator = 0;
  readonly kind = "Deposit";

  toJSON(): DepositJSON {
    return {
      kind: "Deposit",
    };
  }

  toEncodable() {
    return {
      Deposit: {},
    };
  }
}

export interface BorrowJSON {
  kind: "Borrow";
}

export class Borrow {
  static readonly discriminator = 1;
  static readonly kind = "Borrow";
  readonly discriminator = 1;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.SpotBalanceTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Deposit" in obj) {
    return new Deposit();
  }
  if ("Borrow" in obj) {
    return new Borrow();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.SpotBalanceTypeJSON
): types.SpotBalanceTypeKind {
  switch (obj.kind) {
    case "Deposit": {
      return new Deposit();
    }
    case "Borrow": {
      return new Borrow();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Deposit"),
    borsh.struct([], "Borrow"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
