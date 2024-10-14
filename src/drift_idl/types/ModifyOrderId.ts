import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export type UserOrderIdFields = [number];
export type UserOrderIdValue = [number];

export interface UserOrderIdJSON {
  kind: "UserOrderId";
  value: [number];
}

export class UserOrderId {
  static readonly discriminator = 0;
  static readonly kind = "UserOrderId";
  readonly discriminator = 0;
  readonly kind = "UserOrderId";
  readonly value: UserOrderIdValue;

  constructor(value: UserOrderIdFields) {
    this.value = [value[0]];
  }

  toJSON(): UserOrderIdJSON {
    return {
      kind: "UserOrderId",
      value: [this.value[0]],
    };
  }

  toEncodable() {
    return {
      UserOrderId: {
        _0: this.value[0],
      },
    };
  }
}

export type OrderIdFields = [number];
export type OrderIdValue = [number];

export interface OrderIdJSON {
  kind: "OrderId";
  value: [number];
}

export class OrderId {
  static readonly discriminator = 1;
  static readonly kind = "OrderId";
  readonly discriminator = 1;
  readonly kind = "OrderId";
  readonly value: OrderIdValue;

  constructor(value: OrderIdFields) {
    this.value = [value[0]];
  }

  toJSON(): OrderIdJSON {
    return {
      kind: "OrderId",
      value: [this.value[0]],
    };
  }

  toEncodable() {
    return {
      OrderId: {
        _0: this.value[0],
      },
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.ModifyOrderIdKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object");
  }

  if ("UserOrderId" in obj) {
    const val = obj["UserOrderId"];
    return new UserOrderId([val["_0"]]);
  }
  if ("OrderId" in obj) {
    const val = obj["OrderId"];
    return new OrderId([val["_0"]]);
  }

  throw new Error("Invalid enum object");
}

export function fromJSON(
  obj: types.ModifyOrderIdJSON
): types.ModifyOrderIdKind {
  switch (obj.kind) {
    case "UserOrderId": {
      return new UserOrderId([obj.value[0]]);
    }
    case "OrderId": {
      return new OrderId([obj.value[0]]);
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([borsh.u8("_0")], "UserOrderId"),
    borsh.struct([borsh.u32("_0")], "OrderId"),
  ]);
  if (property !== undefined) {
    return ret.replicate(property);
  }
  return ret;
}
