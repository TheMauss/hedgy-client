import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface UpdateCumulativeInterestJSON {
  kind: "UpdateCumulativeInterest";
}

export class UpdateCumulativeInterest {
  static readonly discriminator = 0;
  static readonly kind = "UpdateCumulativeInterest";
  readonly discriminator = 0;
  readonly kind = "UpdateCumulativeInterest";

  toJSON(): UpdateCumulativeInterestJSON {
    return {
      kind: "UpdateCumulativeInterest",
    };
  }

  toEncodable() {
    return {
      UpdateCumulativeInterest: {},
    };
  }
}

export interface FillJSON {
  kind: "Fill";
}

export class Fill {
  static readonly discriminator = 1;
  static readonly kind = "Fill";
  readonly discriminator = 1;
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

export interface DepositJSON {
  kind: "Deposit";
}

export class Deposit {
  static readonly discriminator = 2;
  static readonly kind = "Deposit";
  readonly discriminator = 2;
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

export interface LiquidationJSON {
  kind: "Liquidation";
}

export class Liquidation {
  static readonly discriminator = 4;
  static readonly kind = "Liquidation";
  readonly discriminator = 4;
  readonly kind = "Liquidation";

  toJSON(): LiquidationJSON {
    return {
      kind: "Liquidation",
    };
  }

  toEncodable() {
    return {
      Liquidation: {},
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.SpotOperationKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("UpdateCumulativeInterest" in obj) {
    return new UpdateCumulativeInterest();
  }
  if ("Fill" in obj) {
    return new Fill();
  }
  if ("Deposit" in obj) {
    return new Deposit();
  }
  if ("Withdraw" in obj) {
    return new Withdraw();
  }
  if ("Liquidation" in obj) {
    return new Liquidation();
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.SpotOperationJSON
): types.SpotOperationKind {
  switch (obj.kind) {
    case "UpdateCumulativeInterest": {
      return new UpdateCumulativeInterest();
    }
    case "Fill": {
      return new Fill();
    }
    case "Deposit": {
      return new Deposit();
    }
    case "Withdraw": {
      return new Withdraw();
    }
    case "Liquidation": {
      return new Liquidation();
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "UpdateCumulativeInterest"),
    borsh.struct([], "Fill"),
    borsh.struct([], "Deposit"),
    borsh.struct([], "Withdraw"),
    borsh.struct([], "Liquidation"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
