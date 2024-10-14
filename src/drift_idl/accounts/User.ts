import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UserFields {
  /** The owner/authority of the account */
  authority: PublicKey;
  /** An addresses that can control the account on the authority's behalf. Has limited power, cant withdraw */
  delegate: PublicKey;
  /** Encoded display name e.g. "toly" */
  name: Array<number>;
  /** The user's spot positions */
  spotPositions: Array<types.SpotPositionFields>;
  /** The user's perp positions */
  perpPositions: Array<types.PerpPositionFields>;
  /** The user's orders */
  orders: Array<types.OrderFields>;
  /** The last time the user added perp lp positions */
  lastAddPerpLpSharesTs: BN;
  /**
   * The total values of deposits the user has made
   * precision: QUOTE_PRECISION
   */
  totalDeposits: BN;
  /**
   * The total values of withdrawals the user has made
   * precision: QUOTE_PRECISION
   */
  totalWithdraws: BN;
  /**
   * The total socialized loss the users has incurred upon the protocol
   * precision: QUOTE_PRECISION
   */
  totalSocialLoss: BN;
  /**
   * Fees (taker fees, maker rebate, referrer reward, filler reward) and pnl for perps
   * precision: QUOTE_PRECISION
   */
  settledPerpPnl: BN;
  /**
   * Fees (taker fees, maker rebate, filler reward) for spot
   * precision: QUOTE_PRECISION
   */
  cumulativeSpotFees: BN;
  /**
   * Cumulative funding paid/received for perps
   * precision: QUOTE_PRECISION
   */
  cumulativePerpFunding: BN;
  /**
   * The amount of margin freed during liquidation. Used to force the liquidation to occur over a period of time
   * Defaults to zero when not being liquidated
   * precision: QUOTE_PRECISION
   */
  liquidationMarginFreed: BN;
  /** The last slot a user was active. Used to determine if a user is idle */
  lastActiveSlot: BN;
  /** Every user order has an order id. This is the next order id to be used */
  nextOrderId: number;
  /** Custom max initial margin ratio for the user */
  maxMarginRatio: number;
  /** The next liquidation id to be used for user */
  nextLiquidationId: number;
  /** The sub account id for this user */
  subAccountId: number;
  /** Whether the user is active, being liquidated or bankrupt */
  status: number;
  /** Whether the user has enabled margin trading */
  isMarginTradingEnabled: boolean;
  /**
   * User is idle if they haven't interacted with the protocol in 1 week and they have no orders, perp positions or borrows
   * Off-chain keeper bots can ignore users that are idle
   */
  idle: boolean;
  /** number of open orders */
  openOrders: number;
  /** Whether or not user has open order */
  hasOpenOrder: boolean;
  /** number of open orders with auction */
  openAuctions: number;
  /** Whether or not user has open order with auction */
  hasOpenAuction: boolean;
  marginMode: types.MarginModeKind;
  padding1: Array<number>;
  lastFuelBonusUpdateTs: number;
  padding: Array<number>;
}

export interface UserJSON {
  /** The owner/authority of the account */
  authority: string;
  /** An addresses that can control the account on the authority's behalf. Has limited power, cant withdraw */
  delegate: string;
  /** Encoded display name e.g. "toly" */
  name: Array<number>;
  /** The user's spot positions */
  spotPositions: Array<types.SpotPositionJSON>;
  /** The user's perp positions */
  perpPositions: Array<types.PerpPositionJSON>;
  /** The user's orders */
  orders: Array<types.OrderJSON>;
  /** The last time the user added perp lp positions */
  lastAddPerpLpSharesTs: string;
  /**
   * The total values of deposits the user has made
   * precision: QUOTE_PRECISION
   */
  totalDeposits: string;
  /**
   * The total values of withdrawals the user has made
   * precision: QUOTE_PRECISION
   */
  totalWithdraws: string;
  /**
   * The total socialized loss the users has incurred upon the protocol
   * precision: QUOTE_PRECISION
   */
  totalSocialLoss: string;
  /**
   * Fees (taker fees, maker rebate, referrer reward, filler reward) and pnl for perps
   * precision: QUOTE_PRECISION
   */
  settledPerpPnl: string;
  /**
   * Fees (taker fees, maker rebate, filler reward) for spot
   * precision: QUOTE_PRECISION
   */
  cumulativeSpotFees: string;
  /**
   * Cumulative funding paid/received for perps
   * precision: QUOTE_PRECISION
   */
  cumulativePerpFunding: string;
  /**
   * The amount of margin freed during liquidation. Used to force the liquidation to occur over a period of time
   * Defaults to zero when not being liquidated
   * precision: QUOTE_PRECISION
   */
  liquidationMarginFreed: string;
  /** The last slot a user was active. Used to determine if a user is idle */
  lastActiveSlot: string;
  /** Every user order has an order id. This is the next order id to be used */
  nextOrderId: number;
  /** Custom max initial margin ratio for the user */
  maxMarginRatio: number;
  /** The next liquidation id to be used for user */
  nextLiquidationId: number;
  /** The sub account id for this user */
  subAccountId: number;
  /** Whether the user is active, being liquidated or bankrupt */
  status: number;
  /** Whether the user has enabled margin trading */
  isMarginTradingEnabled: boolean;
  /**
   * User is idle if they haven't interacted with the protocol in 1 week and they have no orders, perp positions or borrows
   * Off-chain keeper bots can ignore users that are idle
   */
  idle: boolean;
  /** number of open orders */
  openOrders: number;
  /** Whether or not user has open order */
  hasOpenOrder: boolean;
  /** number of open orders with auction */
  openAuctions: number;
  /** Whether or not user has open order with auction */
  hasOpenAuction: boolean;
  marginMode: types.MarginModeJSON;
  padding1: Array<number>;
  lastFuelBonusUpdateTs: number;
  padding: Array<number>;
}

export class User {
  /** The owner/authority of the account */
  readonly authority: PublicKey;
  /** An addresses that can control the account on the authority's behalf. Has limited power, cant withdraw */
  readonly delegate: PublicKey;
  /** Encoded display name e.g. "toly" */
  readonly name: Array<number>;
  /** The user's spot positions */
  readonly spotPositions: Array<types.SpotPosition>;
  /** The user's perp positions */
  readonly perpPositions: Array<types.PerpPosition>;
  /** The user's orders */
  readonly orders: Array<types.Order>;
  /** The last time the user added perp lp positions */
  readonly lastAddPerpLpSharesTs: BN;
  /**
   * The total values of deposits the user has made
   * precision: QUOTE_PRECISION
   */
  readonly totalDeposits: BN;
  /**
   * The total values of withdrawals the user has made
   * precision: QUOTE_PRECISION
   */
  readonly totalWithdraws: BN;
  /**
   * The total socialized loss the users has incurred upon the protocol
   * precision: QUOTE_PRECISION
   */
  readonly totalSocialLoss: BN;
  /**
   * Fees (taker fees, maker rebate, referrer reward, filler reward) and pnl for perps
   * precision: QUOTE_PRECISION
   */
  readonly settledPerpPnl: BN;
  /**
   * Fees (taker fees, maker rebate, filler reward) for spot
   * precision: QUOTE_PRECISION
   */
  readonly cumulativeSpotFees: BN;
  /**
   * Cumulative funding paid/received for perps
   * precision: QUOTE_PRECISION
   */
  readonly cumulativePerpFunding: BN;
  /**
   * The amount of margin freed during liquidation. Used to force the liquidation to occur over a period of time
   * Defaults to zero when not being liquidated
   * precision: QUOTE_PRECISION
   */
  readonly liquidationMarginFreed: BN;
  /** The last slot a user was active. Used to determine if a user is idle */
  readonly lastActiveSlot: BN;
  /** Every user order has an order id. This is the next order id to be used */
  readonly nextOrderId: number;
  /** Custom max initial margin ratio for the user */
  readonly maxMarginRatio: number;
  /** The next liquidation id to be used for user */
  readonly nextLiquidationId: number;
  /** The sub account id for this user */
  readonly subAccountId: number;
  /** Whether the user is active, being liquidated or bankrupt */
  readonly status: number;
  /** Whether the user has enabled margin trading */
  readonly isMarginTradingEnabled: boolean;
  /**
   * User is idle if they haven't interacted with the protocol in 1 week and they have no orders, perp positions or borrows
   * Off-chain keeper bots can ignore users that are idle
   */
  readonly idle: boolean;
  /** number of open orders */
  readonly openOrders: number;
  /** Whether or not user has open order */
  readonly hasOpenOrder: boolean;
  /** number of open orders with auction */
  readonly openAuctions: number;
  /** Whether or not user has open order with auction */
  readonly hasOpenAuction: boolean;
  readonly marginMode: types.MarginModeKind;
  readonly padding1: Array<number>;
  readonly lastFuelBonusUpdateTs: number;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    159, 117, 95, 227, 239, 151, 58, 236,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("authority"),
    borsh.publicKey("delegate"),
    borsh.array(borsh.u8(), 32, "name"),
    borsh.array(types.SpotPosition.layout(), 8, "spotPositions"),
    borsh.array(types.PerpPosition.layout(), 8, "perpPositions"),
    borsh.array(types.Order.layout(), 32, "orders"),
    borsh.i64("lastAddPerpLpSharesTs"),
    borsh.u64("totalDeposits"),
    borsh.u64("totalWithdraws"),
    borsh.u64("totalSocialLoss"),
    borsh.i64("settledPerpPnl"),
    borsh.i64("cumulativeSpotFees"),
    borsh.i64("cumulativePerpFunding"),
    borsh.u64("liquidationMarginFreed"),
    borsh.u64("lastActiveSlot"),
    borsh.u32("nextOrderId"),
    borsh.u32("maxMarginRatio"),
    borsh.u16("nextLiquidationId"),
    borsh.u16("subAccountId"),
    borsh.u8("status"),
    borsh.bool("isMarginTradingEnabled"),
    borsh.bool("idle"),
    borsh.u8("openOrders"),
    borsh.bool("hasOpenOrder"),
    borsh.u8("openAuctions"),
    borsh.bool("hasOpenAuction"),
    types.MarginMode.layout("marginMode"),
    borsh.array(borsh.u8(), 4, "padding1"),
    borsh.u32("lastFuelBonusUpdateTs"),
    borsh.array(borsh.u8(), 12, "padding"),
  ]);

  constructor(fields: UserFields) {
    this.authority = fields.authority;
    this.delegate = fields.delegate;
    this.name = fields.name;
    this.spotPositions = fields.spotPositions.map(
      (item) => new types.SpotPosition({ ...item })
    );
    this.perpPositions = fields.perpPositions.map(
      (item) => new types.PerpPosition({ ...item })
    );
    this.orders = fields.orders.map((item) => new types.Order({ ...item }));
    this.lastAddPerpLpSharesTs = fields.lastAddPerpLpSharesTs;
    this.totalDeposits = fields.totalDeposits;
    this.totalWithdraws = fields.totalWithdraws;
    this.totalSocialLoss = fields.totalSocialLoss;
    this.settledPerpPnl = fields.settledPerpPnl;
    this.cumulativeSpotFees = fields.cumulativeSpotFees;
    this.cumulativePerpFunding = fields.cumulativePerpFunding;
    this.liquidationMarginFreed = fields.liquidationMarginFreed;
    this.lastActiveSlot = fields.lastActiveSlot;
    this.nextOrderId = fields.nextOrderId;
    this.maxMarginRatio = fields.maxMarginRatio;
    this.nextLiquidationId = fields.nextLiquidationId;
    this.subAccountId = fields.subAccountId;
    this.status = fields.status;
    this.isMarginTradingEnabled = fields.isMarginTradingEnabled;
    this.idle = fields.idle;
    this.openOrders = fields.openOrders;
    this.hasOpenOrder = fields.hasOpenOrder;
    this.openAuctions = fields.openAuctions;
    this.hasOpenAuction = fields.hasOpenAuction;
    this.marginMode = fields.marginMode;
    this.padding1 = fields.padding1;
    this.lastFuelBonusUpdateTs = fields.lastFuelBonusUpdateTs;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<User | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(programId)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[],
    programId: PublicKey = PROGRAM_ID
  ): Promise<Array<User | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses);

    return infos.map((info) => {
      if (info === null) {
        return null;
      }
      if (!info.owner.equals(programId)) {
        throw new Error("account doesn't belong to this program");
      }

      return this.decode(info.data);
    });
  }

  static decode(data: Buffer): User {
    if (!data.slice(0, 8).equals(User.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = User.layout.decode(data.slice(8));

    return new User({
      authority: dec.authority,
      delegate: dec.delegate,
      name: dec.name,
      spotPositions: dec.spotPositions.map(
        (
          item: any /* eslint-disable-line @typescript-eslint/no-explicit-any */
        ) => types.SpotPosition.fromDecoded(item)
      ),
      perpPositions: dec.perpPositions.map(
        (
          item: any /* eslint-disable-line @typescript-eslint/no-explicit-any */
        ) => types.PerpPosition.fromDecoded(item)
      ),
      orders: dec.orders.map(
        (
          item: any /* eslint-disable-line @typescript-eslint/no-explicit-any */
        ) => types.Order.fromDecoded(item)
      ),
      lastAddPerpLpSharesTs: dec.lastAddPerpLpSharesTs,
      totalDeposits: dec.totalDeposits,
      totalWithdraws: dec.totalWithdraws,
      totalSocialLoss: dec.totalSocialLoss,
      settledPerpPnl: dec.settledPerpPnl,
      cumulativeSpotFees: dec.cumulativeSpotFees,
      cumulativePerpFunding: dec.cumulativePerpFunding,
      liquidationMarginFreed: dec.liquidationMarginFreed,
      lastActiveSlot: dec.lastActiveSlot,
      nextOrderId: dec.nextOrderId,
      maxMarginRatio: dec.maxMarginRatio,
      nextLiquidationId: dec.nextLiquidationId,
      subAccountId: dec.subAccountId,
      status: dec.status,
      isMarginTradingEnabled: dec.isMarginTradingEnabled,
      idle: dec.idle,
      openOrders: dec.openOrders,
      hasOpenOrder: dec.hasOpenOrder,
      openAuctions: dec.openAuctions,
      hasOpenAuction: dec.hasOpenAuction,
      marginMode: types.MarginMode.fromDecoded(dec.marginMode),
      padding1: dec.padding1,
      lastFuelBonusUpdateTs: dec.lastFuelBonusUpdateTs,
      padding: dec.padding,
    });
  }

  toJSON(): UserJSON {
    return {
      authority: this.authority.toString(),
      delegate: this.delegate.toString(),
      name: this.name,
      spotPositions: this.spotPositions.map((item) => item.toJSON()),
      perpPositions: this.perpPositions.map((item) => item.toJSON()),
      orders: this.orders.map((item) => item.toJSON()),
      lastAddPerpLpSharesTs: this.lastAddPerpLpSharesTs.toString(),
      totalDeposits: this.totalDeposits.toString(),
      totalWithdraws: this.totalWithdraws.toString(),
      totalSocialLoss: this.totalSocialLoss.toString(),
      settledPerpPnl: this.settledPerpPnl.toString(),
      cumulativeSpotFees: this.cumulativeSpotFees.toString(),
      cumulativePerpFunding: this.cumulativePerpFunding.toString(),
      liquidationMarginFreed: this.liquidationMarginFreed.toString(),
      lastActiveSlot: this.lastActiveSlot.toString(),
      nextOrderId: this.nextOrderId,
      maxMarginRatio: this.maxMarginRatio,
      nextLiquidationId: this.nextLiquidationId,
      subAccountId: this.subAccountId,
      status: this.status,
      isMarginTradingEnabled: this.isMarginTradingEnabled,
      idle: this.idle,
      openOrders: this.openOrders,
      hasOpenOrder: this.hasOpenOrder,
      openAuctions: this.openAuctions,
      hasOpenAuction: this.hasOpenAuction,
      marginMode: this.marginMode.toJSON(),
      padding1: this.padding1,
      lastFuelBonusUpdateTs: this.lastFuelBonusUpdateTs,
      padding: this.padding,
    };
  }

  static fromJSON(obj: UserJSON): User {
    return new User({
      authority: new PublicKey(obj.authority),
      delegate: new PublicKey(obj.delegate),
      name: obj.name,
      spotPositions: obj.spotPositions.map((item) =>
        types.SpotPosition.fromJSON(item)
      ),
      perpPositions: obj.perpPositions.map((item) =>
        types.PerpPosition.fromJSON(item)
      ),
      orders: obj.orders.map((item) => types.Order.fromJSON(item)),
      lastAddPerpLpSharesTs: new BN(obj.lastAddPerpLpSharesTs),
      totalDeposits: new BN(obj.totalDeposits),
      totalWithdraws: new BN(obj.totalWithdraws),
      totalSocialLoss: new BN(obj.totalSocialLoss),
      settledPerpPnl: new BN(obj.settledPerpPnl),
      cumulativeSpotFees: new BN(obj.cumulativeSpotFees),
      cumulativePerpFunding: new BN(obj.cumulativePerpFunding),
      liquidationMarginFreed: new BN(obj.liquidationMarginFreed),
      lastActiveSlot: new BN(obj.lastActiveSlot),
      nextOrderId: obj.nextOrderId,
      maxMarginRatio: obj.maxMarginRatio,
      nextLiquidationId: obj.nextLiquidationId,
      subAccountId: obj.subAccountId,
      status: obj.status,
      isMarginTradingEnabled: obj.isMarginTradingEnabled,
      idle: obj.idle,
      openOrders: obj.openOrders,
      hasOpenOrder: obj.hasOpenOrder,
      openAuctions: obj.openAuctions,
      hasOpenAuction: obj.hasOpenAuction,
      marginMode: types.MarginMode.fromJSON(obj.marginMode),
      padding1: obj.padding1,
      lastFuelBonusUpdateTs: obj.lastFuelBonusUpdateTs,
      padding: obj.padding,
    });
  }
}
