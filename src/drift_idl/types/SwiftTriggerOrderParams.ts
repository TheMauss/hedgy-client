import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface SwiftTriggerOrderParamsFields {
  triggerPrice: BN;
  baseAssetAmount: BN;
}

export interface SwiftTriggerOrderParamsJSON {
  triggerPrice: string;
  baseAssetAmount: string;
}

export class SwiftTriggerOrderParams {
  readonly triggerPrice: BN;
  readonly baseAssetAmount: BN;

  constructor(fields: SwiftTriggerOrderParamsFields) {
    this.triggerPrice = fields.triggerPrice;
    this.baseAssetAmount = fields.baseAssetAmount;
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u64("triggerPrice"), borsh.u64("baseAssetAmount")],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new SwiftTriggerOrderParams({
      triggerPrice: obj.triggerPrice,
      baseAssetAmount: obj.baseAssetAmount,
    });
  }

  static toEncodable(fields: SwiftTriggerOrderParamsFields) {
    return {
      triggerPrice: fields.triggerPrice,
      baseAssetAmount: fields.baseAssetAmount,
    };
  }

  toJSON(): SwiftTriggerOrderParamsJSON {
    return {
      triggerPrice: this.triggerPrice.toString(),
      baseAssetAmount: this.baseAssetAmount.toString(),
    };
  }

  static fromJSON(obj: SwiftTriggerOrderParamsJSON): SwiftTriggerOrderParams {
    return new SwiftTriggerOrderParams({
      triggerPrice: new BN(obj.triggerPrice),
      baseAssetAmount: new BN(obj.baseAssetAmount),
    });
  }

  toEncodable() {
    return SwiftTriggerOrderParams.toEncodable(this);
  }
}
