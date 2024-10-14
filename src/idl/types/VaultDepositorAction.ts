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

export interface WithdrawRequestJSON {
  kind: "WithdrawRequest";
}

export class WithdrawRequest {
  static readonly discriminator = 1;
  static readonly kind = "WithdrawRequest";
  readonly discriminator = 1;
  readonly kind = "WithdrawRequest";

  toJSON(): WithdrawRequestJSON {
    return {
      kind: "WithdrawRequest",
    };
  }

  toEncodable() {
    return {
      WithdrawRequest: {},
    };
  }
}

export interface CancelWithdrawRequestJSON {
  kind: "CancelWithdrawRequest";
}

export class CancelWithdrawRequest {
  static readonly discriminator = 2;
  static readonly kind = "CancelWithdrawRequest";
  readonly discriminator = 2;
  readonly kind = "CancelWithdrawRequest";

  toJSON(): CancelWithdrawRequestJSON {
    return {
      kind: "CancelWithdrawRequest",
    };
  }

  toEncodable() {
    return {
      CancelWithdrawRequest: {},
    };
  }
}

export interface WithdrawJSON {
  kind: "Withdraw";
}

export class Withdraw {
  static readonly discriminator = 3;
  static readonly kind = "Withdraw";
  readonly discriminator = 3;
  readonly kind = "Withdraw";

  toJSON(): WithdrawJSON {
    return {
      kind: "Withdraw",
    };
  }

  toEncodable() {
    return {
      Withdraw: {},
    };
  }
}

export interface FeePaymentJSON {
  kind: "FeePayment";
}

export class FeePayment {
  static readonly discriminator = 4;
  static readonly kind = "FeePayment";
  readonly discriminator = 4;
  readonly kind = "FeePayment";

  toJSON(): FeePaymentJSON {
    return {
      kind: "FeePayment",
    };
  }

  toEncodable() {
    return {
      FeePayment: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.VaultDepositorActionKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("Deposit" in obj) {
    return new Deposit();
  }
  if ("WithdrawRequest" in obj) {
    return new WithdrawRequest();
  }
  if ("CancelWithdrawRequest" in obj) {
    return new CancelWithdrawRequest();
  }
  if ("Withdraw" in obj) {
    return new Withdraw();
  }
  if ("FeePayment" in obj) {
    return new FeePayment();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.VaultDepositorActionJSON
): types.VaultDepositorActionKind {
  switch (obj.kind) {
    case "Deposit": {
      return new Deposit();
    }
    case "WithdrawRequest": {
      return new WithdrawRequest();
    }
    case "CancelWithdrawRequest": {
      return new CancelWithdrawRequest();
    }
    case "Withdraw": {
      return new Withdraw();
    }
    case "FeePayment": {
      return new FeePayment();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Deposit"),
    borsh.struct([], "WithdrawRequest"),
    borsh.struct([], "CancelWithdrawRequest"),
    borsh.struct([], "Withdraw"),
    borsh.struct([], "FeePayment"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
