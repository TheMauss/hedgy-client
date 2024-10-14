import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PerpMarketFields {
  /** The perp market's address. It is a pda of the market index */
  pubkey: PublicKey;
  /** The automated market maker */
  amm: types.AMMFields;
  /**
   * The market's pnl pool. When users settle negative pnl, the balance increases.
   * When users settle positive pnl, the balance decreases. Can not go negative.
   */
  pnlPool: types.PoolBalanceFields;
  /** Encoded display name for the perp market e.g. SOL-PERP */
  name: Array<number>;
  /** The perp market's claim on the insurance fund */
  insuranceClaim: types.InsuranceClaimFields;
  /**
   * The max pnl imbalance before positive pnl asset weight is discounted
   * pnl imbalance is the difference between long and short pnl. When it's greater than 0,
   * the amm has negative pnl and the initial asset weight for positive pnl is discounted
   * precision = QUOTE_PRECISION
   */
  unrealizedPnlMaxImbalance: BN;
  /** The ts when the market will be expired. Only set if market is in reduce only mode */
  expiryTs: BN;
  /**
   * The price at which positions will be settled. Only set if market is expired
   * precision = PRICE_PRECISION
   */
  expiryPrice: BN;
  /** Every trade has a fill record id. This is the next id to be used */
  nextFillRecordId: BN;
  /** Every funding rate update has a record id. This is the next id to be used */
  nextFundingRateRecordId: BN;
  /** Every amm k updated has a record id. This is the next id to be used */
  nextCurveRecordId: BN;
  /**
   * The initial margin fraction factor. Used to increase margin ratio for large positions
   * precision: MARGIN_PRECISION
   */
  imfFactor: number;
  /**
   * The imf factor for unrealized pnl. Used to discount asset weight for large positive pnl
   * precision: MARGIN_PRECISION
   */
  unrealizedPnlImfFactor: number;
  /**
   * The fee the liquidator is paid for taking over perp position
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  liquidatorFee: number;
  /**
   * The fee the insurance fund receives from liquidation
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  ifLiquidationFee: number;
  /**
   * The margin ratio which determines how much collateral is required to open a position
   * e.g. margin ratio of .1 means a user must have $100 of total collateral to open a $1000 position
   * precision: MARGIN_PRECISION
   */
  marginRatioInitial: number;
  /**
   * The margin ratio which determines when a user will be liquidated
   * e.g. margin ratio of .05 means a user must have $50 of total collateral to maintain a $1000 position
   * else they will be liquidated
   * precision: MARGIN_PRECISION
   */
  marginRatioMaintenance: number;
  /**
   * The initial asset weight for positive pnl. Negative pnl always has an asset weight of 1
   * precision: SPOT_WEIGHT_PRECISION
   */
  unrealizedPnlInitialAssetWeight: number;
  /**
   * The maintenance asset weight for positive pnl. Negative pnl always has an asset weight of 1
   * precision: SPOT_WEIGHT_PRECISION
   */
  unrealizedPnlMaintenanceAssetWeight: number;
  /** number of users in a position (base) */
  numberOfUsersWithBase: number;
  /** number of users in a position (pnl) or pnl (quote) */
  numberOfUsers: number;
  marketIndex: number;
  /**
   * Whether a market is active, reduce only, expired, etc
   * Affects whether users can open/close positions
   */
  status: types.MarketStatusKind;
  /** Currently only Perpetual markets are supported */
  contractType: types.ContractTypeKind;
  /**
   * The contract tier determines how much insurance a market can receive, with more speculative markets receiving less insurance
   * It also influences the order perp markets can be liquidated, with less speculative markets being liquidated first
   */
  contractTier: types.ContractTierKind;
  pausedOperations: number;
  /** The spot market that pnl is settled in */
  quoteSpotMarketIndex: number;
  /**
   * Between -100 and 100, represents what % to increase/decrease the fee by
   * E.g. if this is -50 and the fee is 5bps, the new fee will be 2.5bps
   * if this is 50 and the fee is 5bps, the new fee will be 7.5bps
   */
  feeAdjustment: number;
  /**
   * fuel multiplier for perp funding
   * precision: 10
   */
  fuelBoostPosition: number;
  /**
   * fuel multiplier for perp taker
   * precision: 10
   */
  fuelBoostTaker: number;
  /**
   * fuel multiplier for perp maker
   * precision: 10
   */
  fuelBoostMaker: number;
  padding1: number;
  highLeverageMarginRatioInitial: number;
  highLeverageMarginRatioMaintenance: number;
  padding: Array<number>;
}

export interface PerpMarketJSON {
  /** The perp market's address. It is a pda of the market index */
  pubkey: string;
  /** The automated market maker */
  amm: types.AMMJSON;
  /**
   * The market's pnl pool. When users settle negative pnl, the balance increases.
   * When users settle positive pnl, the balance decreases. Can not go negative.
   */
  pnlPool: types.PoolBalanceJSON;
  /** Encoded display name for the perp market e.g. SOL-PERP */
  name: Array<number>;
  /** The perp market's claim on the insurance fund */
  insuranceClaim: types.InsuranceClaimJSON;
  /**
   * The max pnl imbalance before positive pnl asset weight is discounted
   * pnl imbalance is the difference between long and short pnl. When it's greater than 0,
   * the amm has negative pnl and the initial asset weight for positive pnl is discounted
   * precision = QUOTE_PRECISION
   */
  unrealizedPnlMaxImbalance: string;
  /** The ts when the market will be expired. Only set if market is in reduce only mode */
  expiryTs: string;
  /**
   * The price at which positions will be settled. Only set if market is expired
   * precision = PRICE_PRECISION
   */
  expiryPrice: string;
  /** Every trade has a fill record id. This is the next id to be used */
  nextFillRecordId: string;
  /** Every funding rate update has a record id. This is the next id to be used */
  nextFundingRateRecordId: string;
  /** Every amm k updated has a record id. This is the next id to be used */
  nextCurveRecordId: string;
  /**
   * The initial margin fraction factor. Used to increase margin ratio for large positions
   * precision: MARGIN_PRECISION
   */
  imfFactor: number;
  /**
   * The imf factor for unrealized pnl. Used to discount asset weight for large positive pnl
   * precision: MARGIN_PRECISION
   */
  unrealizedPnlImfFactor: number;
  /**
   * The fee the liquidator is paid for taking over perp position
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  liquidatorFee: number;
  /**
   * The fee the insurance fund receives from liquidation
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  ifLiquidationFee: number;
  /**
   * The margin ratio which determines how much collateral is required to open a position
   * e.g. margin ratio of .1 means a user must have $100 of total collateral to open a $1000 position
   * precision: MARGIN_PRECISION
   */
  marginRatioInitial: number;
  /**
   * The margin ratio which determines when a user will be liquidated
   * e.g. margin ratio of .05 means a user must have $50 of total collateral to maintain a $1000 position
   * else they will be liquidated
   * precision: MARGIN_PRECISION
   */
  marginRatioMaintenance: number;
  /**
   * The initial asset weight for positive pnl. Negative pnl always has an asset weight of 1
   * precision: SPOT_WEIGHT_PRECISION
   */
  unrealizedPnlInitialAssetWeight: number;
  /**
   * The maintenance asset weight for positive pnl. Negative pnl always has an asset weight of 1
   * precision: SPOT_WEIGHT_PRECISION
   */
  unrealizedPnlMaintenanceAssetWeight: number;
  /** number of users in a position (base) */
  numberOfUsersWithBase: number;
  /** number of users in a position (pnl) or pnl (quote) */
  numberOfUsers: number;
  marketIndex: number;
  /**
   * Whether a market is active, reduce only, expired, etc
   * Affects whether users can open/close positions
   */
  status: types.MarketStatusJSON;
  /** Currently only Perpetual markets are supported */
  contractType: types.ContractTypeJSON;
  /**
   * The contract tier determines how much insurance a market can receive, with more speculative markets receiving less insurance
   * It also influences the order perp markets can be liquidated, with less speculative markets being liquidated first
   */
  contractTier: types.ContractTierJSON;
  pausedOperations: number;
  /** The spot market that pnl is settled in */
  quoteSpotMarketIndex: number;
  /**
   * Between -100 and 100, represents what % to increase/decrease the fee by
   * E.g. if this is -50 and the fee is 5bps, the new fee will be 2.5bps
   * if this is 50 and the fee is 5bps, the new fee will be 7.5bps
   */
  feeAdjustment: number;
  /**
   * fuel multiplier for perp funding
   * precision: 10
   */
  fuelBoostPosition: number;
  /**
   * fuel multiplier for perp taker
   * precision: 10
   */
  fuelBoostTaker: number;
  /**
   * fuel multiplier for perp maker
   * precision: 10
   */
  fuelBoostMaker: number;
  padding1: number;
  highLeverageMarginRatioInitial: number;
  highLeverageMarginRatioMaintenance: number;
  padding: Array<number>;
}

export class PerpMarket {
  /** The perp market's address. It is a pda of the market index */
  readonly pubkey: PublicKey;
  /** The automated market maker */
  readonly amm: types.AMM;
  /**
   * The market's pnl pool. When users settle negative pnl, the balance increases.
   * When users settle positive pnl, the balance decreases. Can not go negative.
   */
  readonly pnlPool: types.PoolBalance;
  /** Encoded display name for the perp market e.g. SOL-PERP */
  readonly name: Array<number>;
  /** The perp market's claim on the insurance fund */
  readonly insuranceClaim: types.InsuranceClaim;
  /**
   * The max pnl imbalance before positive pnl asset weight is discounted
   * pnl imbalance is the difference between long and short pnl. When it's greater than 0,
   * the amm has negative pnl and the initial asset weight for positive pnl is discounted
   * precision = QUOTE_PRECISION
   */
  readonly unrealizedPnlMaxImbalance: BN;
  /** The ts when the market will be expired. Only set if market is in reduce only mode */
  readonly expiryTs: BN;
  /**
   * The price at which positions will be settled. Only set if market is expired
   * precision = PRICE_PRECISION
   */
  readonly expiryPrice: BN;
  /** Every trade has a fill record id. This is the next id to be used */
  readonly nextFillRecordId: BN;
  /** Every funding rate update has a record id. This is the next id to be used */
  readonly nextFundingRateRecordId: BN;
  /** Every amm k updated has a record id. This is the next id to be used */
  readonly nextCurveRecordId: BN;
  /**
   * The initial margin fraction factor. Used to increase margin ratio for large positions
   * precision: MARGIN_PRECISION
   */
  readonly imfFactor: number;
  /**
   * The imf factor for unrealized pnl. Used to discount asset weight for large positive pnl
   * precision: MARGIN_PRECISION
   */
  readonly unrealizedPnlImfFactor: number;
  /**
   * The fee the liquidator is paid for taking over perp position
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  readonly liquidatorFee: number;
  /**
   * The fee the insurance fund receives from liquidation
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  readonly ifLiquidationFee: number;
  /**
   * The margin ratio which determines how much collateral is required to open a position
   * e.g. margin ratio of .1 means a user must have $100 of total collateral to open a $1000 position
   * precision: MARGIN_PRECISION
   */
  readonly marginRatioInitial: number;
  /**
   * The margin ratio which determines when a user will be liquidated
   * e.g. margin ratio of .05 means a user must have $50 of total collateral to maintain a $1000 position
   * else they will be liquidated
   * precision: MARGIN_PRECISION
   */
  readonly marginRatioMaintenance: number;
  /**
   * The initial asset weight for positive pnl. Negative pnl always has an asset weight of 1
   * precision: SPOT_WEIGHT_PRECISION
   */
  readonly unrealizedPnlInitialAssetWeight: number;
  /**
   * The maintenance asset weight for positive pnl. Negative pnl always has an asset weight of 1
   * precision: SPOT_WEIGHT_PRECISION
   */
  readonly unrealizedPnlMaintenanceAssetWeight: number;
  /** number of users in a position (base) */
  readonly numberOfUsersWithBase: number;
  /** number of users in a position (pnl) or pnl (quote) */
  readonly numberOfUsers: number;
  readonly marketIndex: number;
  /**
   * Whether a market is active, reduce only, expired, etc
   * Affects whether users can open/close positions
   */
  readonly status: types.MarketStatusKind;
  /** Currently only Perpetual markets are supported */
  readonly contractType: types.ContractTypeKind;
  /**
   * The contract tier determines how much insurance a market can receive, with more speculative markets receiving less insurance
   * It also influences the order perp markets can be liquidated, with less speculative markets being liquidated first
   */
  readonly contractTier: types.ContractTierKind;
  readonly pausedOperations: number;
  /** The spot market that pnl is settled in */
  readonly quoteSpotMarketIndex: number;
  /**
   * Between -100 and 100, represents what % to increase/decrease the fee by
   * E.g. if this is -50 and the fee is 5bps, the new fee will be 2.5bps
   * if this is 50 and the fee is 5bps, the new fee will be 7.5bps
   */
  readonly feeAdjustment: number;
  /**
   * fuel multiplier for perp funding
   * precision: 10
   */
  readonly fuelBoostPosition: number;
  /**
   * fuel multiplier for perp taker
   * precision: 10
   */
  readonly fuelBoostTaker: number;
  /**
   * fuel multiplier for perp maker
   * precision: 10
   */
  readonly fuelBoostMaker: number;
  readonly padding1: number;
  readonly highLeverageMarginRatioInitial: number;
  readonly highLeverageMarginRatioMaintenance: number;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    10, 223, 12, 44, 107, 245, 55, 247,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("pubkey"),
    types.AMM.layout("amm"),
    types.PoolBalance.layout("pnlPool"),
    borsh.array(borsh.u8(), 32, "name"),
    types.InsuranceClaim.layout("insuranceClaim"),
    borsh.u64("unrealizedPnlMaxImbalance"),
    borsh.i64("expiryTs"),
    borsh.i64("expiryPrice"),
    borsh.u64("nextFillRecordId"),
    borsh.u64("nextFundingRateRecordId"),
    borsh.u64("nextCurveRecordId"),
    borsh.u32("imfFactor"),
    borsh.u32("unrealizedPnlImfFactor"),
    borsh.u32("liquidatorFee"),
    borsh.u32("ifLiquidationFee"),
    borsh.u32("marginRatioInitial"),
    borsh.u32("marginRatioMaintenance"),
    borsh.u32("unrealizedPnlInitialAssetWeight"),
    borsh.u32("unrealizedPnlMaintenanceAssetWeight"),
    borsh.u32("numberOfUsersWithBase"),
    borsh.u32("numberOfUsers"),
    borsh.u16("marketIndex"),
    types.MarketStatus.layout("status"),
    types.ContractType.layout("contractType"),
    types.ContractTier.layout("contractTier"),
    borsh.u8("pausedOperations"),
    borsh.u16("quoteSpotMarketIndex"),
    borsh.i16("feeAdjustment"),
    borsh.u8("fuelBoostPosition"),
    borsh.u8("fuelBoostTaker"),
    borsh.u8("fuelBoostMaker"),
    borsh.u8("padding1"),
    borsh.u16("highLeverageMarginRatioInitial"),
    borsh.u16("highLeverageMarginRatioMaintenance"),
    borsh.array(borsh.u8(), 38, "padding"),
  ]);

  constructor(fields: PerpMarketFields) {
    this.pubkey = fields.pubkey;
    this.amm = new types.AMM({ ...fields.amm });
    this.pnlPool = new types.PoolBalance({ ...fields.pnlPool });
    this.name = fields.name;
    this.insuranceClaim = new types.InsuranceClaim({
      ...fields.insuranceClaim,
    });
    this.unrealizedPnlMaxImbalance = fields.unrealizedPnlMaxImbalance;
    this.expiryTs = fields.expiryTs;
    this.expiryPrice = fields.expiryPrice;
    this.nextFillRecordId = fields.nextFillRecordId;
    this.nextFundingRateRecordId = fields.nextFundingRateRecordId;
    this.nextCurveRecordId = fields.nextCurveRecordId;
    this.imfFactor = fields.imfFactor;
    this.unrealizedPnlImfFactor = fields.unrealizedPnlImfFactor;
    this.liquidatorFee = fields.liquidatorFee;
    this.ifLiquidationFee = fields.ifLiquidationFee;
    this.marginRatioInitial = fields.marginRatioInitial;
    this.marginRatioMaintenance = fields.marginRatioMaintenance;
    this.unrealizedPnlInitialAssetWeight =
      fields.unrealizedPnlInitialAssetWeight;
    this.unrealizedPnlMaintenanceAssetWeight =
      fields.unrealizedPnlMaintenanceAssetWeight;
    this.numberOfUsersWithBase = fields.numberOfUsersWithBase;
    this.numberOfUsers = fields.numberOfUsers;
    this.marketIndex = fields.marketIndex;
    this.status = fields.status;
    this.contractType = fields.contractType;
    this.contractTier = fields.contractTier;
    this.pausedOperations = fields.pausedOperations;
    this.quoteSpotMarketIndex = fields.quoteSpotMarketIndex;
    this.feeAdjustment = fields.feeAdjustment;
    this.fuelBoostPosition = fields.fuelBoostPosition;
    this.fuelBoostTaker = fields.fuelBoostTaker;
    this.fuelBoostMaker = fields.fuelBoostMaker;
    this.padding1 = fields.padding1;
    this.highLeverageMarginRatioInitial = fields.highLeverageMarginRatioInitial;
    this.highLeverageMarginRatioMaintenance =
      fields.highLeverageMarginRatioMaintenance;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<PerpMarket | null> {
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
  ): Promise<Array<PerpMarket | null>> {
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

  static decode(data: Buffer): PerpMarket {
    if (!data.slice(0, 8).equals(PerpMarket.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = PerpMarket.layout.decode(data.slice(8));

    return new PerpMarket({
      pubkey: dec.pubkey,
      amm: types.AMM.fromDecoded(dec.amm),
      pnlPool: types.PoolBalance.fromDecoded(dec.pnlPool),
      name: dec.name,
      insuranceClaim: types.InsuranceClaim.fromDecoded(dec.insuranceClaim),
      unrealizedPnlMaxImbalance: dec.unrealizedPnlMaxImbalance,
      expiryTs: dec.expiryTs,
      expiryPrice: dec.expiryPrice,
      nextFillRecordId: dec.nextFillRecordId,
      nextFundingRateRecordId: dec.nextFundingRateRecordId,
      nextCurveRecordId: dec.nextCurveRecordId,
      imfFactor: dec.imfFactor,
      unrealizedPnlImfFactor: dec.unrealizedPnlImfFactor,
      liquidatorFee: dec.liquidatorFee,
      ifLiquidationFee: dec.ifLiquidationFee,
      marginRatioInitial: dec.marginRatioInitial,
      marginRatioMaintenance: dec.marginRatioMaintenance,
      unrealizedPnlInitialAssetWeight: dec.unrealizedPnlInitialAssetWeight,
      unrealizedPnlMaintenanceAssetWeight:
        dec.unrealizedPnlMaintenanceAssetWeight,
      numberOfUsersWithBase: dec.numberOfUsersWithBase,
      numberOfUsers: dec.numberOfUsers,
      marketIndex: dec.marketIndex,
      status: types.MarketStatus.fromDecoded(dec.status),
      contractType: types.ContractType.fromDecoded(dec.contractType),
      contractTier: types.ContractTier.fromDecoded(dec.contractTier),
      pausedOperations: dec.pausedOperations,
      quoteSpotMarketIndex: dec.quoteSpotMarketIndex,
      feeAdjustment: dec.feeAdjustment,
      fuelBoostPosition: dec.fuelBoostPosition,
      fuelBoostTaker: dec.fuelBoostTaker,
      fuelBoostMaker: dec.fuelBoostMaker,
      padding1: dec.padding1,
      highLeverageMarginRatioInitial: dec.highLeverageMarginRatioInitial,
      highLeverageMarginRatioMaintenance:
        dec.highLeverageMarginRatioMaintenance,
      padding: dec.padding,
    });
  }

  toJSON(): PerpMarketJSON {
    return {
      pubkey: this.pubkey.toString(),
      amm: this.amm.toJSON(),
      pnlPool: this.pnlPool.toJSON(),
      name: this.name,
      insuranceClaim: this.insuranceClaim.toJSON(),
      unrealizedPnlMaxImbalance: this.unrealizedPnlMaxImbalance.toString(),
      expiryTs: this.expiryTs.toString(),
      expiryPrice: this.expiryPrice.toString(),
      nextFillRecordId: this.nextFillRecordId.toString(),
      nextFundingRateRecordId: this.nextFundingRateRecordId.toString(),
      nextCurveRecordId: this.nextCurveRecordId.toString(),
      imfFactor: this.imfFactor,
      unrealizedPnlImfFactor: this.unrealizedPnlImfFactor,
      liquidatorFee: this.liquidatorFee,
      ifLiquidationFee: this.ifLiquidationFee,
      marginRatioInitial: this.marginRatioInitial,
      marginRatioMaintenance: this.marginRatioMaintenance,
      unrealizedPnlInitialAssetWeight: this.unrealizedPnlInitialAssetWeight,
      unrealizedPnlMaintenanceAssetWeight:
        this.unrealizedPnlMaintenanceAssetWeight,
      numberOfUsersWithBase: this.numberOfUsersWithBase,
      numberOfUsers: this.numberOfUsers,
      marketIndex: this.marketIndex,
      status: this.status.toJSON(),
      contractType: this.contractType.toJSON(),
      contractTier: this.contractTier.toJSON(),
      pausedOperations: this.pausedOperations,
      quoteSpotMarketIndex: this.quoteSpotMarketIndex,
      feeAdjustment: this.feeAdjustment,
      fuelBoostPosition: this.fuelBoostPosition,
      fuelBoostTaker: this.fuelBoostTaker,
      fuelBoostMaker: this.fuelBoostMaker,
      padding1: this.padding1,
      highLeverageMarginRatioInitial: this.highLeverageMarginRatioInitial,
      highLeverageMarginRatioMaintenance:
        this.highLeverageMarginRatioMaintenance,
      padding: this.padding,
    };
  }

  static fromJSON(obj: PerpMarketJSON): PerpMarket {
    return new PerpMarket({
      pubkey: new PublicKey(obj.pubkey),
      amm: types.AMM.fromJSON(obj.amm),
      pnlPool: types.PoolBalance.fromJSON(obj.pnlPool),
      name: obj.name,
      insuranceClaim: types.InsuranceClaim.fromJSON(obj.insuranceClaim),
      unrealizedPnlMaxImbalance: new BN(obj.unrealizedPnlMaxImbalance),
      expiryTs: new BN(obj.expiryTs),
      expiryPrice: new BN(obj.expiryPrice),
      nextFillRecordId: new BN(obj.nextFillRecordId),
      nextFundingRateRecordId: new BN(obj.nextFundingRateRecordId),
      nextCurveRecordId: new BN(obj.nextCurveRecordId),
      imfFactor: obj.imfFactor,
      unrealizedPnlImfFactor: obj.unrealizedPnlImfFactor,
      liquidatorFee: obj.liquidatorFee,
      ifLiquidationFee: obj.ifLiquidationFee,
      marginRatioInitial: obj.marginRatioInitial,
      marginRatioMaintenance: obj.marginRatioMaintenance,
      unrealizedPnlInitialAssetWeight: obj.unrealizedPnlInitialAssetWeight,
      unrealizedPnlMaintenanceAssetWeight:
        obj.unrealizedPnlMaintenanceAssetWeight,
      numberOfUsersWithBase: obj.numberOfUsersWithBase,
      numberOfUsers: obj.numberOfUsers,
      marketIndex: obj.marketIndex,
      status: types.MarketStatus.fromJSON(obj.status),
      contractType: types.ContractType.fromJSON(obj.contractType),
      contractTier: types.ContractTier.fromJSON(obj.contractTier),
      pausedOperations: obj.pausedOperations,
      quoteSpotMarketIndex: obj.quoteSpotMarketIndex,
      feeAdjustment: obj.feeAdjustment,
      fuelBoostPosition: obj.fuelBoostPosition,
      fuelBoostTaker: obj.fuelBoostTaker,
      fuelBoostMaker: obj.fuelBoostMaker,
      padding1: obj.padding1,
      highLeverageMarginRatioInitial: obj.highLeverageMarginRatioInitial,
      highLeverageMarginRatioMaintenance:
        obj.highLeverageMarginRatioMaintenance,
      padding: obj.padding,
    });
  }
}
