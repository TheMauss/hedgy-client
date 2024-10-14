import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface SwiftOrderParamsMessageFields {
  swiftOrderParams: types.OrderParamsFields;
  expectedOrderId: number;
  subAccountId: number;
  takeProfitOrderParams: types.SwiftTriggerOrderParamsFields | null;
  stopLossOrderParams: types.SwiftTriggerOrderParamsFields | null;
}

export interface SwiftOrderParamsMessageJSON {
  swiftOrderParams: types.OrderParamsJSON;
  expectedOrderId: number;
  subAccountId: number;
  takeProfitOrderParams: types.SwiftTriggerOrderParamsJSON | null;
  stopLossOrderParams: types.SwiftTriggerOrderParamsJSON | null;
}

export class SwiftOrderParamsMessage {
  readonly swiftOrderParams: types.OrderParams;
  readonly expectedOrderId: number;
  readonly subAccountId: number;
  readonly takeProfitOrderParams: types.SwiftTriggerOrderParams | null;
  readonly stopLossOrderParams: types.SwiftTriggerOrderParams | null;

  constructor(fields: SwiftOrderParamsMessageFields) {
    this.swiftOrderParams = new types.OrderParams({
      ...fields.swiftOrderParams,
    });
    this.expectedOrderId = fields.expectedOrderId;
    this.subAccountId = fields.subAccountId;
    this.takeProfitOrderParams =
      (fields.takeProfitOrderParams &&
        new types.SwiftTriggerOrderParams({
          ...fields.takeProfitOrderParams,
        })) ||
      null;
    this.stopLossOrderParams =
      (fields.stopLossOrderParams &&
        new types.SwiftTriggerOrderParams({ ...fields.stopLossOrderParams })) ||
      null;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        types.OrderParams.layout("swiftOrderParams"),
        borsh.i32("expectedOrderId"),
        borsh.u16("subAccountId"),
        borsh.option(
          types.SwiftTriggerOrderParams.layout(),
          "takeProfitOrderParams"
        ),
        borsh.option(
          types.SwiftTriggerOrderParams.layout(),
          "stopLossOrderParams"
        ),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new SwiftOrderParamsMessage({
      swiftOrderParams: types.OrderParams.fromDecoded(obj.swiftOrderParams),
      expectedOrderId: obj.expectedOrderId,
      subAccountId: obj.subAccountId,
      takeProfitOrderParams:
        (obj.takeProfitOrderParams &&
          types.SwiftTriggerOrderParams.fromDecoded(
            obj.takeProfitOrderParams
          )) ||
        null,
      stopLossOrderParams:
        (obj.stopLossOrderParams &&
          types.SwiftTriggerOrderParams.fromDecoded(obj.stopLossOrderParams)) ||
        null,
    });
  }

  static toEncodable(fields: SwiftOrderParamsMessageFields) {
    return {
      swiftOrderParams: types.OrderParams.toEncodable(fields.swiftOrderParams),
      expectedOrderId: fields.expectedOrderId,
      subAccountId: fields.subAccountId,
      takeProfitOrderParams:
        (fields.takeProfitOrderParams &&
          types.SwiftTriggerOrderParams.toEncodable(
            fields.takeProfitOrderParams
          )) ||
        null,
      stopLossOrderParams:
        (fields.stopLossOrderParams &&
          types.SwiftTriggerOrderParams.toEncodable(
            fields.stopLossOrderParams
          )) ||
        null,
    };
  }

  toJSON(): SwiftOrderParamsMessageJSON {
    return {
      swiftOrderParams: this.swiftOrderParams.toJSON(),
      expectedOrderId: this.expectedOrderId,
      subAccountId: this.subAccountId,
      takeProfitOrderParams:
        (this.takeProfitOrderParams && this.takeProfitOrderParams.toJSON()) ||
        null,
      stopLossOrderParams:
        (this.stopLossOrderParams && this.stopLossOrderParams.toJSON()) || null,
    };
  }

  static fromJSON(obj: SwiftOrderParamsMessageJSON): SwiftOrderParamsMessage {
    return new SwiftOrderParamsMessage({
      swiftOrderParams: types.OrderParams.fromJSON(obj.swiftOrderParams),
      expectedOrderId: obj.expectedOrderId,
      subAccountId: obj.subAccountId,
      takeProfitOrderParams:
        (obj.takeProfitOrderParams &&
          types.SwiftTriggerOrderParams.fromJSON(obj.takeProfitOrderParams)) ||
        null,
      stopLossOrderParams:
        (obj.stopLossOrderParams &&
          types.SwiftTriggerOrderParams.fromJSON(obj.stopLossOrderParams)) ||
        null,
    });
  }

  toEncodable() {
    return SwiftOrderParamsMessage.toEncodable(this);
  }
}
