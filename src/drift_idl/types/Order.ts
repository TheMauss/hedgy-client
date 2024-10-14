import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface OrderFields {
  /** The slot the order was placed */
  slot: BN;
  /**
   * The limit price for the order (can be 0 for market orders)
   * For orders with an auction, this price isn't used until the auction is complete
   * precision: PRICE_PRECISION
   */
  price: BN;
  /**
   * The size of the order
   * precision for perps: BASE_PRECISION
   * precision for spot: token mint precision
   */
  baseAssetAmount: BN;
  /**
   * The amount of the order filled
   * precision for perps: BASE_PRECISION
   * precision for spot: token mint precision
   */
  baseAssetAmountFilled: BN;
  /**
   * The amount of quote filled for the order
   * precision: QUOTE_PRECISION
   */
  quoteAssetAmountFilled: BN;
  /**
   * At what price the order will be triggered. Only relevant for trigger orders
   * precision: PRICE_PRECISION
   */
  triggerPrice: BN;
  /**
   * The start price for the auction. Only relevant for market/oracle orders
   * precision: PRICE_PRECISION
   */
  auctionStartPrice: BN;
  /**
   * The end price for the auction. Only relevant for market/oracle orders
   * precision: PRICE_PRECISION
   */
  auctionEndPrice: BN;
  /** The time when the order will expire */
  maxTs: BN;
  /**
   * If set, the order limit price is the oracle price + this offset
   * precision: PRICE_PRECISION
   */
  oraclePriceOffset: number;
  /** The id for the order. Each users has their own order id space */
  orderId: number;
  /** The perp/spot market index */
  marketIndex: number;
  /** Whether the order is open or unused */
  status: types.OrderStatusKind;
  /** The type of order */
  orderType: types.OrderTypeKind;
  /** Whether market is spot or perp */
  marketType: types.MarketTypeKind;
  /** User generated order id. Can make it easier to place/cancel orders */
  userOrderId: number;
  /** What the users position was when the order was placed */
  existingPositionDirection: types.PositionDirectionKind;
  /** Whether the user is going long or short. LONG = bid, SHORT = ask */
  direction: types.PositionDirectionKind;
  /** Whether the order is allowed to only reduce position size */
  reduceOnly: boolean;
  /** Whether the order must be a maker */
  postOnly: boolean;
  /** Whether the order must be canceled the same slot it is placed */
  immediateOrCancel: boolean;
  /** Whether the order is triggered above or below the trigger price. Only relevant for trigger orders */
  triggerCondition: types.OrderTriggerConditionKind;
  /** How many slots the auction lasts */
  auctionDuration: number;
  padding: Array<number>;
}

export interface OrderJSON {
  /** The slot the order was placed */
  slot: string;
  /**
   * The limit price for the order (can be 0 for market orders)
   * For orders with an auction, this price isn't used until the auction is complete
   * precision: PRICE_PRECISION
   */
  price: string;
  /**
   * The size of the order
   * precision for perps: BASE_PRECISION
   * precision for spot: token mint precision
   */
  baseAssetAmount: string;
  /**
   * The amount of the order filled
   * precision for perps: BASE_PRECISION
   * precision for spot: token mint precision
   */
  baseAssetAmountFilled: string;
  /**
   * The amount of quote filled for the order
   * precision: QUOTE_PRECISION
   */
  quoteAssetAmountFilled: string;
  /**
   * At what price the order will be triggered. Only relevant for trigger orders
   * precision: PRICE_PRECISION
   */
  triggerPrice: string;
  /**
   * The start price for the auction. Only relevant for market/oracle orders
   * precision: PRICE_PRECISION
   */
  auctionStartPrice: string;
  /**
   * The end price for the auction. Only relevant for market/oracle orders
   * precision: PRICE_PRECISION
   */
  auctionEndPrice: string;
  /** The time when the order will expire */
  maxTs: string;
  /**
   * If set, the order limit price is the oracle price + this offset
   * precision: PRICE_PRECISION
   */
  oraclePriceOffset: number;
  /** The id for the order. Each users has their own order id space */
  orderId: number;
  /** The perp/spot market index */
  marketIndex: number;
  /** Whether the order is open or unused */
  status: types.OrderStatusJSON;
  /** The type of order */
  orderType: types.OrderTypeJSON;
  /** Whether market is spot or perp */
  marketType: types.MarketTypeJSON;
  /** User generated order id. Can make it easier to place/cancel orders */
  userOrderId: number;
  /** What the users position was when the order was placed */
  existingPositionDirection: types.PositionDirectionJSON;
  /** Whether the user is going long or short. LONG = bid, SHORT = ask */
  direction: types.PositionDirectionJSON;
  /** Whether the order is allowed to only reduce position size */
  reduceOnly: boolean;
  /** Whether the order must be a maker */
  postOnly: boolean;
  /** Whether the order must be canceled the same slot it is placed */
  immediateOrCancel: boolean;
  /** Whether the order is triggered above or below the trigger price. Only relevant for trigger orders */
  triggerCondition: types.OrderTriggerConditionJSON;
  /** How many slots the auction lasts */
  auctionDuration: number;
  padding: Array<number>;
}

export class Order {
  /** The slot the order was placed */
  readonly slot: BN;
  /**
   * The limit price for the order (can be 0 for market orders)
   * For orders with an auction, this price isn't used until the auction is complete
   * precision: PRICE_PRECISION
   */
  readonly price: BN;
  /**
   * The size of the order
   * precision for perps: BASE_PRECISION
   * precision for spot: token mint precision
   */
  readonly baseAssetAmount: BN;
  /**
   * The amount of the order filled
   * precision for perps: BASE_PRECISION
   * precision for spot: token mint precision
   */
  readonly baseAssetAmountFilled: BN;
  /**
   * The amount of quote filled for the order
   * precision: QUOTE_PRECISION
   */
  readonly quoteAssetAmountFilled: BN;
  /**
   * At what price the order will be triggered. Only relevant for trigger orders
   * precision: PRICE_PRECISION
   */
  readonly triggerPrice: BN;
  /**
   * The start price for the auction. Only relevant for market/oracle orders
   * precision: PRICE_PRECISION
   */
  readonly auctionStartPrice: BN;
  /**
   * The end price for the auction. Only relevant for market/oracle orders
   * precision: PRICE_PRECISION
   */
  readonly auctionEndPrice: BN;
  /** The time when the order will expire */
  readonly maxTs: BN;
  /**
   * If set, the order limit price is the oracle price + this offset
   * precision: PRICE_PRECISION
   */
  readonly oraclePriceOffset: number;
  /** The id for the order. Each users has their own order id space */
  readonly orderId: number;
  /** The perp/spot market index */
  readonly marketIndex: number;
  /** Whether the order is open or unused */
  readonly status: types.OrderStatusKind;
  /** The type of order */
  readonly orderType: types.OrderTypeKind;
  /** Whether market is spot or perp */
  readonly marketType: types.MarketTypeKind;
  /** User generated order id. Can make it easier to place/cancel orders */
  readonly userOrderId: number;
  /** What the users position was when the order was placed */
  readonly existingPositionDirection: types.PositionDirectionKind;
  /** Whether the user is going long or short. LONG = bid, SHORT = ask */
  readonly direction: types.PositionDirectionKind;
  /** Whether the order is allowed to only reduce position size */
  readonly reduceOnly: boolean;
  /** Whether the order must be a maker */
  readonly postOnly: boolean;
  /** Whether the order must be canceled the same slot it is placed */
  readonly immediateOrCancel: boolean;
  /** Whether the order is triggered above or below the trigger price. Only relevant for trigger orders */
  readonly triggerCondition: types.OrderTriggerConditionKind;
  /** How many slots the auction lasts */
  readonly auctionDuration: number;
  readonly padding: Array<number>;

  constructor(fields: OrderFields) {
    this.slot = fields.slot;
    this.price = fields.price;
    this.baseAssetAmount = fields.baseAssetAmount;
    this.baseAssetAmountFilled = fields.baseAssetAmountFilled;
    this.quoteAssetAmountFilled = fields.quoteAssetAmountFilled;
    this.triggerPrice = fields.triggerPrice;
    this.auctionStartPrice = fields.auctionStartPrice;
    this.auctionEndPrice = fields.auctionEndPrice;
    this.maxTs = fields.maxTs;
    this.oraclePriceOffset = fields.oraclePriceOffset;
    this.orderId = fields.orderId;
    this.marketIndex = fields.marketIndex;
    this.status = fields.status;
    this.orderType = fields.orderType;
    this.marketType = fields.marketType;
    this.userOrderId = fields.userOrderId;
    this.existingPositionDirection = fields.existingPositionDirection;
    this.direction = fields.direction;
    this.reduceOnly = fields.reduceOnly;
    this.postOnly = fields.postOnly;
    this.immediateOrCancel = fields.immediateOrCancel;
    this.triggerCondition = fields.triggerCondition;
    this.auctionDuration = fields.auctionDuration;
    this.padding = fields.padding;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("slot"),
        borsh.u64("price"),
        borsh.u64("baseAssetAmount"),
        borsh.u64("baseAssetAmountFilled"),
        borsh.u64("quoteAssetAmountFilled"),
        borsh.u64("triggerPrice"),
        borsh.i64("auctionStartPrice"),
        borsh.i64("auctionEndPrice"),
        borsh.i64("maxTs"),
        borsh.i32("oraclePriceOffset"),
        borsh.u32("orderId"),
        borsh.u16("marketIndex"),
        types.OrderStatus.layout("status"),
        types.OrderType.layout("orderType"),
        types.MarketType.layout("marketType"),
        borsh.u8("userOrderId"),
        types.PositionDirection.layout("existingPositionDirection"),
        types.PositionDirection.layout("direction"),
        borsh.bool("reduceOnly"),
        borsh.bool("postOnly"),
        borsh.bool("immediateOrCancel"),
        types.OrderTriggerCondition.layout("triggerCondition"),
        borsh.u8("auctionDuration"),
        borsh.array(borsh.u8(), 3, "padding"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Order({
      slot: obj.slot,
      price: obj.price,
      baseAssetAmount: obj.baseAssetAmount,
      baseAssetAmountFilled: obj.baseAssetAmountFilled,
      quoteAssetAmountFilled: obj.quoteAssetAmountFilled,
      triggerPrice: obj.triggerPrice,
      auctionStartPrice: obj.auctionStartPrice,
      auctionEndPrice: obj.auctionEndPrice,
      maxTs: obj.maxTs,
      oraclePriceOffset: obj.oraclePriceOffset,
      orderId: obj.orderId,
      marketIndex: obj.marketIndex,
      status: types.OrderStatus.fromDecoded(obj.status),
      orderType: types.OrderType.fromDecoded(obj.orderType),
      marketType: types.MarketType.fromDecoded(obj.marketType),
      userOrderId: obj.userOrderId,
      existingPositionDirection: types.PositionDirection.fromDecoded(
        obj.existingPositionDirection
      ),
      direction: types.PositionDirection.fromDecoded(obj.direction),
      reduceOnly: obj.reduceOnly,
      postOnly: obj.postOnly,
      immediateOrCancel: obj.immediateOrCancel,
      triggerCondition: types.OrderTriggerCondition.fromDecoded(
        obj.triggerCondition
      ),
      auctionDuration: obj.auctionDuration,
      padding: obj.padding,
    });
  }

  static toEncodable(fields: OrderFields) {
    return {
      slot: fields.slot,
      price: fields.price,
      baseAssetAmount: fields.baseAssetAmount,
      baseAssetAmountFilled: fields.baseAssetAmountFilled,
      quoteAssetAmountFilled: fields.quoteAssetAmountFilled,
      triggerPrice: fields.triggerPrice,
      auctionStartPrice: fields.auctionStartPrice,
      auctionEndPrice: fields.auctionEndPrice,
      maxTs: fields.maxTs,
      oraclePriceOffset: fields.oraclePriceOffset,
      orderId: fields.orderId,
      marketIndex: fields.marketIndex,
      status: fields.status.toEncodable(),
      orderType: fields.orderType.toEncodable(),
      marketType: fields.marketType.toEncodable(),
      userOrderId: fields.userOrderId,
      existingPositionDirection: fields.existingPositionDirection.toEncodable(),
      direction: fields.direction.toEncodable(),
      reduceOnly: fields.reduceOnly,
      postOnly: fields.postOnly,
      immediateOrCancel: fields.immediateOrCancel,
      triggerCondition: fields.triggerCondition.toEncodable(),
      auctionDuration: fields.auctionDuration,
      padding: fields.padding,
    };
  }

  toJSON(): OrderJSON {
    return {
      slot: this.slot.toString(),
      price: this.price.toString(),
      baseAssetAmount: this.baseAssetAmount.toString(),
      baseAssetAmountFilled: this.baseAssetAmountFilled.toString(),
      quoteAssetAmountFilled: this.quoteAssetAmountFilled.toString(),
      triggerPrice: this.triggerPrice.toString(),
      auctionStartPrice: this.auctionStartPrice.toString(),
      auctionEndPrice: this.auctionEndPrice.toString(),
      maxTs: this.maxTs.toString(),
      oraclePriceOffset: this.oraclePriceOffset,
      orderId: this.orderId,
      marketIndex: this.marketIndex,
      status: this.status.toJSON(),
      orderType: this.orderType.toJSON(),
      marketType: this.marketType.toJSON(),
      userOrderId: this.userOrderId,
      existingPositionDirection: this.existingPositionDirection.toJSON(),
      direction: this.direction.toJSON(),
      reduceOnly: this.reduceOnly,
      postOnly: this.postOnly,
      immediateOrCancel: this.immediateOrCancel,
      triggerCondition: this.triggerCondition.toJSON(),
      auctionDuration: this.auctionDuration,
      padding: this.padding,
    };
  }

  static fromJSON(obj: OrderJSON): Order {
    return new Order({
      slot: new BN(obj.slot),
      price: new BN(obj.price),
      baseAssetAmount: new BN(obj.baseAssetAmount),
      baseAssetAmountFilled: new BN(obj.baseAssetAmountFilled),
      quoteAssetAmountFilled: new BN(obj.quoteAssetAmountFilled),
      triggerPrice: new BN(obj.triggerPrice),
      auctionStartPrice: new BN(obj.auctionStartPrice),
      auctionEndPrice: new BN(obj.auctionEndPrice),
      maxTs: new BN(obj.maxTs),
      oraclePriceOffset: obj.oraclePriceOffset,
      orderId: obj.orderId,
      marketIndex: obj.marketIndex,
      status: types.OrderStatus.fromJSON(obj.status),
      orderType: types.OrderType.fromJSON(obj.orderType),
      marketType: types.MarketType.fromJSON(obj.marketType),
      userOrderId: obj.userOrderId,
      existingPositionDirection: types.PositionDirection.fromJSON(
        obj.existingPositionDirection
      ),
      direction: types.PositionDirection.fromJSON(obj.direction),
      reduceOnly: obj.reduceOnly,
      postOnly: obj.postOnly,
      immediateOrCancel: obj.immediateOrCancel,
      triggerCondition: types.OrderTriggerCondition.fromJSON(
        obj.triggerCondition
      ),
      auctionDuration: obj.auctionDuration,
      padding: obj.padding,
    });
  }

  toEncodable() {
    return Order.toEncodable(this);
  }
}
