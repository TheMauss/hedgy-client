import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface OrderParamsFields {
  orderType: types.OrderTypeKind;
  marketType: types.MarketTypeKind;
  direction: types.PositionDirectionKind;
  userOrderId: number;
  baseAssetAmount: BN;
  price: BN;
  marketIndex: number;
  reduceOnly: boolean;
  postOnly: types.PostOnlyParamKind;
  immediateOrCancel: boolean;
  maxTs: BN | null;
  triggerPrice: BN | null;
  triggerCondition: types.OrderTriggerConditionKind;
  oraclePriceOffset: number | null;
  auctionDuration: number | null;
  auctionStartPrice: BN | null;
  auctionEndPrice: BN | null;
}

export interface OrderParamsJSON {
  orderType: types.OrderTypeJSON;
  marketType: types.MarketTypeJSON;
  direction: types.PositionDirectionJSON;
  userOrderId: number;
  baseAssetAmount: string;
  price: string;
  marketIndex: number;
  reduceOnly: boolean;
  postOnly: types.PostOnlyParamJSON;
  immediateOrCancel: boolean;
  maxTs: string | null;
  triggerPrice: string | null;
  triggerCondition: types.OrderTriggerConditionJSON;
  oraclePriceOffset: number | null;
  auctionDuration: number | null;
  auctionStartPrice: string | null;
  auctionEndPrice: string | null;
}

export class OrderParams {
  readonly orderType: types.OrderTypeKind;
  readonly marketType: types.MarketTypeKind;
  readonly direction: types.PositionDirectionKind;
  readonly userOrderId: number;
  readonly baseAssetAmount: BN;
  readonly price: BN;
  readonly marketIndex: number;
  readonly reduceOnly: boolean;
  readonly postOnly: types.PostOnlyParamKind;
  readonly immediateOrCancel: boolean;
  readonly maxTs: BN | null;
  readonly triggerPrice: BN | null;
  readonly triggerCondition: types.OrderTriggerConditionKind;
  readonly oraclePriceOffset: number | null;
  readonly auctionDuration: number | null;
  readonly auctionStartPrice: BN | null;
  readonly auctionEndPrice: BN | null;

  constructor(fields: OrderParamsFields) {
    this.orderType = fields.orderType;
    this.marketType = fields.marketType;
    this.direction = fields.direction;
    this.userOrderId = fields.userOrderId;
    this.baseAssetAmount = fields.baseAssetAmount;
    this.price = fields.price;
    this.marketIndex = fields.marketIndex;
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
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        types.OrderType.layout("orderType"),
        types.MarketType.layout("marketType"),
        types.PositionDirection.layout("direction"),
        borsh.u8("userOrderId"),
        borsh.u64("baseAssetAmount"),
        borsh.u64("price"),
        borsh.u16("marketIndex"),
        borsh.bool("reduceOnly"),
        types.PostOnlyParam.layout("postOnly"),
        borsh.bool("immediateOrCancel"),
        borsh.option(borsh.i64(), "maxTs"),
        borsh.option(borsh.u64(), "triggerPrice"),
        types.OrderTriggerCondition.layout("triggerCondition"),
        borsh.option(borsh.i32(), "oraclePriceOffset"),
        borsh.option(borsh.u8(), "auctionDuration"),
        borsh.option(borsh.i64(), "auctionStartPrice"),
        borsh.option(borsh.i64(), "auctionEndPrice"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new OrderParams({
      orderType: types.OrderType.fromDecoded(obj.orderType),
      marketType: types.MarketType.fromDecoded(obj.marketType),
      direction: types.PositionDirection.fromDecoded(obj.direction),
      userOrderId: obj.userOrderId,
      baseAssetAmount: obj.baseAssetAmount,
      price: obj.price,
      marketIndex: obj.marketIndex,
      reduceOnly: obj.reduceOnly,
      postOnly: types.PostOnlyParam.fromDecoded(obj.postOnly),
      immediateOrCancel: obj.immediateOrCancel,
      maxTs: obj.maxTs,
      triggerPrice: obj.triggerPrice,
      triggerCondition: types.OrderTriggerCondition.fromDecoded(
        obj.triggerCondition
      ),
      oraclePriceOffset: obj.oraclePriceOffset,
      auctionDuration: obj.auctionDuration,
      auctionStartPrice: obj.auctionStartPrice,
      auctionEndPrice: obj.auctionEndPrice,
    });
  }

  static toEncodable(fields: OrderParamsFields) {
    return {
      orderType: fields.orderType.toEncodable(),
      marketType: fields.marketType.toEncodable(),
      direction: fields.direction.toEncodable(),
      userOrderId: fields.userOrderId,
      baseAssetAmount: fields.baseAssetAmount,
      price: fields.price,
      marketIndex: fields.marketIndex,
      reduceOnly: fields.reduceOnly,
      postOnly: fields.postOnly.toEncodable(),
      immediateOrCancel: fields.immediateOrCancel,
      maxTs: fields.maxTs,
      triggerPrice: fields.triggerPrice,
      triggerCondition: fields.triggerCondition.toEncodable(),
      oraclePriceOffset: fields.oraclePriceOffset,
      auctionDuration: fields.auctionDuration,
      auctionStartPrice: fields.auctionStartPrice,
      auctionEndPrice: fields.auctionEndPrice,
    };
  }

  toJSON(): OrderParamsJSON {
    return {
      orderType: this.orderType.toJSON(),
      marketType: this.marketType.toJSON(),
      direction: this.direction.toJSON(),
      userOrderId: this.userOrderId,
      baseAssetAmount: this.baseAssetAmount.toString(),
      price: this.price.toString(),
      marketIndex: this.marketIndex,
      reduceOnly: this.reduceOnly,
      postOnly: this.postOnly.toJSON(),
      immediateOrCancel: this.immediateOrCancel,
      maxTs: (this.maxTs && this.maxTs.toString()) || null,
      triggerPrice: (this.triggerPrice && this.triggerPrice.toString()) || null,
      triggerCondition: this.triggerCondition.toJSON(),
      oraclePriceOffset: this.oraclePriceOffset,
      auctionDuration: this.auctionDuration,
      auctionStartPrice:
        (this.auctionStartPrice && this.auctionStartPrice.toString()) || null,
      auctionEndPrice:
        (this.auctionEndPrice && this.auctionEndPrice.toString()) || null,
    };
  }

  static fromJSON(obj: OrderParamsJSON): OrderParams {
    return new OrderParams({
      orderType: types.OrderType.fromJSON(obj.orderType),
      marketType: types.MarketType.fromJSON(obj.marketType),
      direction: types.PositionDirection.fromJSON(obj.direction),
      userOrderId: obj.userOrderId,
      baseAssetAmount: new BN(obj.baseAssetAmount),
      price: new BN(obj.price),
      marketIndex: obj.marketIndex,
      reduceOnly: obj.reduceOnly,
      postOnly: types.PostOnlyParam.fromJSON(obj.postOnly),
      immediateOrCancel: obj.immediateOrCancel,
      maxTs: (obj.maxTs && new BN(obj.maxTs)) || null,
      triggerPrice: (obj.triggerPrice && new BN(obj.triggerPrice)) || null,
      triggerCondition: types.OrderTriggerCondition.fromJSON(
        obj.triggerCondition
      ),
      oraclePriceOffset: obj.oraclePriceOffset,
      auctionDuration: obj.auctionDuration,
      auctionStartPrice:
        (obj.auctionStartPrice && new BN(obj.auctionStartPrice)) || null,
      auctionEndPrice:
        (obj.auctionEndPrice && new BN(obj.auctionEndPrice)) || null,
    });
  }

  toEncodable() {
    return OrderParams.toEncodable(this);
  }
}
