import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface ModifyOrderParamsFields {
  direction: types.PositionDirectionKind | null;
  baseAssetAmount: BN | null;
  price: BN | null;
  reduceOnly: boolean | null;
  postOnly: types.PostOnlyParamKind | null;
  immediateOrCancel: boolean | null;
  maxTs: BN | null;
  triggerPrice: BN | null;
  triggerCondition: types.OrderTriggerConditionKind | null;
  oraclePriceOffset: number | null;
  auctionDuration: number | null;
  auctionStartPrice: BN | null;
  auctionEndPrice: BN | null;
  policy: types.ModifyOrderPolicyKind | null;
}

export interface ModifyOrderParamsJSON {
  direction: types.PositionDirectionJSON | null;
  baseAssetAmount: string | null;
  price: string | null;
  reduceOnly: boolean | null;
  postOnly: types.PostOnlyParamJSON | null;
  immediateOrCancel: boolean | null;
  maxTs: string | null;
  triggerPrice: string | null;
  triggerCondition: types.OrderTriggerConditionJSON | null;
  oraclePriceOffset: number | null;
  auctionDuration: number | null;
  auctionStartPrice: string | null;
  auctionEndPrice: string | null;
  policy: types.ModifyOrderPolicyJSON | null;
}

export class ModifyOrderParams {
  readonly direction: types.PositionDirectionKind | null;
  readonly baseAssetAmount: BN | null;
  readonly price: BN | null;
  readonly reduceOnly: boolean | null;
  readonly postOnly: types.PostOnlyParamKind | null;
  readonly immediateOrCancel: boolean | null;
  readonly maxTs: BN | null;
  readonly triggerPrice: BN | null;
  readonly triggerCondition: types.OrderTriggerConditionKind | null;
  readonly oraclePriceOffset: number | null;
  readonly auctionDuration: number | null;
  readonly auctionStartPrice: BN | null;
  readonly auctionEndPrice: BN | null;
  readonly policy: types.ModifyOrderPolicyKind | null;

  constructor(fields: ModifyOrderParamsFields) {
    this.direction = fields.direction;
    this.baseAssetAmount = fields.baseAssetAmount;
    this.price = fields.price;
    this.reduceOnly = fields.reduceOnly;
    this.postOnly = fields.postOnly;
    this.immediateOrCancel = fields.immediateOrCancel;
    this.maxTs = fields.maxTs;
    this.triggerPrice = fields.triggerPrice;
    this.triggerCondition = fields.triggerCondition;
    this.oraclePriceOffset = fields.oraclePriceOffset;
    this.auctionDuration = fields.auctionDuration;
    this.auctionStartPrice = fields.auctionStartPrice;
    this.auctionEndPrice = fields.auctionEndPrice;
    this.policy = fields.policy;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.option(types.PositionDirection.layout(), "direction"),
        borsh.option(borsh.u64(), "baseAssetAmount"),
        borsh.option(borsh.u64(), "price"),
        borsh.option(borsh.bool(), "reduceOnly"),
        borsh.option(types.PostOnlyParam.layout(), "postOnly"),
        borsh.option(borsh.bool(), "immediateOrCancel"),
        borsh.option(borsh.i64(), "maxTs"),
        borsh.option(borsh.u64(), "triggerPrice"),
        borsh.option(types.OrderTriggerCondition.layout(), "triggerCondition"),
        borsh.option(borsh.i32(), "oraclePriceOffset"),
        borsh.option(borsh.u8(), "auctionDuration"),
        borsh.option(borsh.i64(), "auctionStartPrice"),
        borsh.option(borsh.i64(), "auctionEndPrice"),
        borsh.option(types.ModifyOrderPolicy.layout(), "policy"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new ModifyOrderParams({
      direction:
        (obj.direction && types.PositionDirection.fromDecoded(obj.direction)) ||
        null,
      baseAssetAmount: obj.baseAssetAmount,
      price: obj.price,
      reduceOnly: obj.reduceOnly,
      postOnly:
        (obj.postOnly && types.PostOnlyParam.fromDecoded(obj.postOnly)) || null,
      immediateOrCancel: obj.immediateOrCancel,
      maxTs: obj.maxTs,
      triggerPrice: obj.triggerPrice,
      triggerCondition:
        (obj.triggerCondition &&
          types.OrderTriggerCondition.fromDecoded(obj.triggerCondition)) ||
        null,
      oraclePriceOffset: obj.oraclePriceOffset,
      auctionDuration: obj.auctionDuration,
      auctionStartPrice: obj.auctionStartPrice,
      auctionEndPrice: obj.auctionEndPrice,
      policy:
        (obj.policy && types.ModifyOrderPolicy.fromDecoded(obj.policy)) || null,
    });
  }

  static toEncodable(fields: ModifyOrderParamsFields) {
    return {
      direction: (fields.direction && fields.direction.toEncodable()) || null,
      baseAssetAmount: fields.baseAssetAmount,
      price: fields.price,
      reduceOnly: fields.reduceOnly,
      postOnly: (fields.postOnly && fields.postOnly.toEncodable()) || null,
      immediateOrCancel: fields.immediateOrCancel,
      maxTs: fields.maxTs,
      triggerPrice: fields.triggerPrice,
      triggerCondition:
        (fields.triggerCondition && fields.triggerCondition.toEncodable()) ||
        null,
      oraclePriceOffset: fields.oraclePriceOffset,
      auctionDuration: fields.auctionDuration,
      auctionStartPrice: fields.auctionStartPrice,
      auctionEndPrice: fields.auctionEndPrice,
      policy: (fields.policy && fields.policy.toEncodable()) || null,
    };
  }

  toJSON(): ModifyOrderParamsJSON {
    return {
      direction: (this.direction && this.direction.toJSON()) || null,
      baseAssetAmount:
        (this.baseAssetAmount && this.baseAssetAmount.toString()) || null,
      price: (this.price && this.price.toString()) || null,
      reduceOnly: this.reduceOnly,
      postOnly: (this.postOnly && this.postOnly.toJSON()) || null,
      immediateOrCancel: this.immediateOrCancel,
      maxTs: (this.maxTs && this.maxTs.toString()) || null,
      triggerPrice: (this.triggerPrice && this.triggerPrice.toString()) || null,
      triggerCondition:
        (this.triggerCondition && this.triggerCondition.toJSON()) || null,
      oraclePriceOffset: this.oraclePriceOffset,
      auctionDuration: this.auctionDuration,
      auctionStartPrice:
        (this.auctionStartPrice && this.auctionStartPrice.toString()) || null,
      auctionEndPrice:
        (this.auctionEndPrice && this.auctionEndPrice.toString()) || null,
      policy: (this.policy && this.policy.toJSON()) || null,
    };
  }

  static fromJSON(obj: ModifyOrderParamsJSON): ModifyOrderParams {
    return new ModifyOrderParams({
      direction:
        (obj.direction && types.PositionDirection.fromJSON(obj.direction)) ||
        null,
      baseAssetAmount:
        (obj.baseAssetAmount && new BN(obj.baseAssetAmount)) || null,
      price: (obj.price && new BN(obj.price)) || null,
      reduceOnly: obj.reduceOnly,
      postOnly:
        (obj.postOnly && types.PostOnlyParam.fromJSON(obj.postOnly)) || null,
      immediateOrCancel: obj.immediateOrCancel,
      maxTs: (obj.maxTs && new BN(obj.maxTs)) || null,
      triggerPrice: (obj.triggerPrice && new BN(obj.triggerPrice)) || null,
      triggerCondition:
        (obj.triggerCondition &&
          types.OrderTriggerCondition.fromJSON(obj.triggerCondition)) ||
        null,
      oraclePriceOffset: obj.oraclePriceOffset,
      auctionDuration: obj.auctionDuration,
      auctionStartPrice:
        (obj.auctionStartPrice && new BN(obj.auctionStartPrice)) || null,
      auctionEndPrice:
        (obj.auctionEndPrice && new BN(obj.auctionEndPrice)) || null,
      policy:
        (obj.policy && types.ModifyOrderPolicy.fromJSON(obj.policy)) || null,
    });
  }

  toEncodable() {
    return ModifyOrderParams.toEncodable(this);
  }
}
