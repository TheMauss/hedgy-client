import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UserStatsFields {
  /** The authority for all of a users sub accounts */
  authority: PublicKey;
  /** The address that referred this user */
  referrer: PublicKey;
  /** Stats on the fees paid by the user */
  fees: types.UserFeesFields;
  /**
   * The timestamp of the next epoch
   * Epoch is used to limit referrer rewards earned in single epoch
   */
  nextEpochTs: BN;
  /**
   * Rolling 30day maker volume for user
   * precision: QUOTE_PRECISION
   */
  makerVolume30d: BN;
  /**
   * Rolling 30day taker volume for user
   * precision: QUOTE_PRECISION
   */
  takerVolume30d: BN;
  /**
   * Rolling 30day filler volume for user
   * precision: QUOTE_PRECISION
   */
  fillerVolume30d: BN;
  /** last time the maker volume was updated */
  lastMakerVolume30dTs: BN;
  /** last time the taker volume was updated */
  lastTakerVolume30dTs: BN;
  /** last time the filler volume was updated */
  lastFillerVolume30dTs: BN;
  /** The amount of tokens staked in the quote spot markets if */
  ifStakedQuoteAssetAmount: BN;
  /** The current number of sub accounts */
  numberOfSubAccounts: number;
  /**
   * The number of sub accounts created. Can be greater than the number of sub accounts if user
   * has deleted sub accounts
   */
  numberOfSubAccountsCreated: number;
  /** Whether the user is a referrer. Sub account 0 can not be deleted if user is a referrer */
  isReferrer: boolean;
  disableUpdatePerpBidAskTwap: boolean;
  padding1: Array<number>;
  /** accumulated fuel for token amounts of insurance */
  fuelInsurance: number;
  /** accumulated fuel for notional of deposits */
  fuelDeposits: number;
  /** accumulate fuel bonus for notional of borrows */
  fuelBorrows: number;
  /** accumulated fuel for perp open interest */
  fuelPositions: number;
  /** accumulate fuel bonus for taker volume */
  fuelTaker: number;
  /** accumulate fuel bonus for maker volume */
  fuelMaker: number;
  /** The amount of tokens staked in the governance spot markets if */
  ifStakedGovTokenAmount: BN;
  /** last unix ts user stats data was used to update if fuel (u32 to save space) */
  lastFuelIfBonusUpdateTs: number;
  padding: Array<number>;
}

export interface UserStatsJSON {
  /** The authority for all of a users sub accounts */
  authority: string;
  /** The address that referred this user */
  referrer: string;
  /** Stats on the fees paid by the user */
  fees: types.UserFeesJSON;
  /**
   * The timestamp of the next epoch
   * Epoch is used to limit referrer rewards earned in single epoch
   */
  nextEpochTs: string;
  /**
   * Rolling 30day maker volume for user
   * precision: QUOTE_PRECISION
   */
  makerVolume30d: string;
  /**
   * Rolling 30day taker volume for user
   * precision: QUOTE_PRECISION
   */
  takerVolume30d: string;
  /**
   * Rolling 30day filler volume for user
   * precision: QUOTE_PRECISION
   */
  fillerVolume30d: string;
  /** last time the maker volume was updated */
  lastMakerVolume30dTs: string;
  /** last time the taker volume was updated */
  lastTakerVolume30dTs: string;
  /** last time the filler volume was updated */
  lastFillerVolume30dTs: string;
  /** The amount of tokens staked in the quote spot markets if */
  ifStakedQuoteAssetAmount: string;
  /** The current number of sub accounts */
  numberOfSubAccounts: number;
  /**
   * The number of sub accounts created. Can be greater than the number of sub accounts if user
   * has deleted sub accounts
   */
  numberOfSubAccountsCreated: number;
  /** Whether the user is a referrer. Sub account 0 can not be deleted if user is a referrer */
  isReferrer: boolean;
  disableUpdatePerpBidAskTwap: boolean;
  padding1: Array<number>;
  /** accumulated fuel for token amounts of insurance */
  fuelInsurance: number;
  /** accumulated fuel for notional of deposits */
  fuelDeposits: number;
  /** accumulate fuel bonus for notional of borrows */
  fuelBorrows: number;
  /** accumulated fuel for perp open interest */
  fuelPositions: number;
  /** accumulate fuel bonus for taker volume */
  fuelTaker: number;
  /** accumulate fuel bonus for maker volume */
  fuelMaker: number;
  /** The amount of tokens staked in the governance spot markets if */
  ifStakedGovTokenAmount: string;
  /** last unix ts user stats data was used to update if fuel (u32 to save space) */
  lastFuelIfBonusUpdateTs: number;
  padding: Array<number>;
}

export class UserStats {
  /** The authority for all of a users sub accounts */
  readonly authority: PublicKey;
  /** The address that referred this user */
  readonly referrer: PublicKey;
  /** Stats on the fees paid by the user */
  readonly fees: types.UserFees;
  /**
   * The timestamp of the next epoch
   * Epoch is used to limit referrer rewards earned in single epoch
   */
  readonly nextEpochTs: BN;
  /**
   * Rolling 30day maker volume for user
   * precision: QUOTE_PRECISION
   */
  readonly makerVolume30d: BN;
  /**
   * Rolling 30day taker volume for user
   * precision: QUOTE_PRECISION
   */
  readonly takerVolume30d: BN;
  /**
   * Rolling 30day filler volume for user
   * precision: QUOTE_PRECISION
   */
  readonly fillerVolume30d: BN;
  /** last time the maker volume was updated */
  readonly lastMakerVolume30dTs: BN;
  /** last time the taker volume was updated */
  readonly lastTakerVolume30dTs: BN;
  /** last time the filler volume was updated */
  readonly lastFillerVolume30dTs: BN;
  /** The amount of tokens staked in the quote spot markets if */
  readonly ifStakedQuoteAssetAmount: BN;
  /** The current number of sub accounts */
  readonly numberOfSubAccounts: number;
  /**
   * The number of sub accounts created. Can be greater than the number of sub accounts if user
   * has deleted sub accounts
   */
  readonly numberOfSubAccountsCreated: number;
  /** Whether the user is a referrer. Sub account 0 can not be deleted if user is a referrer */
  readonly isReferrer: boolean;
  readonly disableUpdatePerpBidAskTwap: boolean;
  readonly padding1: Array<number>;
  /** accumulated fuel for token amounts of insurance */
  readonly fuelInsurance: number;
  /** accumulated fuel for notional of deposits */
  readonly fuelDeposits: number;
  /** accumulate fuel bonus for notional of borrows */
  readonly fuelBorrows: number;
  /** accumulated fuel for perp open interest */
  readonly fuelPositions: number;
  /** accumulate fuel bonus for taker volume */
  readonly fuelTaker: number;
  /** accumulate fuel bonus for maker volume */
  readonly fuelMaker: number;
  /** The amount of tokens staked in the governance spot markets if */
  readonly ifStakedGovTokenAmount: BN;
  /** last unix ts user stats data was used to update if fuel (u32 to save space) */
  readonly lastFuelIfBonusUpdateTs: number;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    176, 223, 136, 27, 122, 79, 32, 227,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("authority"),
    borsh.publicKey("referrer"),
    types.UserFees.layout("fees"),
    borsh.i64("nextEpochTs"),
    borsh.u64("makerVolume30d"),
    borsh.u64("takerVolume30d"),
    borsh.u64("fillerVolume30d"),
    borsh.i64("lastMakerVolume30dTs"),
    borsh.i64("lastTakerVolume30dTs"),
    borsh.i64("lastFillerVolume30dTs"),
    borsh.u64("ifStakedQuoteAssetAmount"),
    borsh.u16("numberOfSubAccounts"),
    borsh.u16("numberOfSubAccountsCreated"),
    borsh.bool("isReferrer"),
    borsh.bool("disableUpdatePerpBidAskTwap"),
    borsh.array(borsh.u8(), 2, "padding1"),
    borsh.u32("fuelInsurance"),
    borsh.u32("fuelDeposits"),
    borsh.u32("fuelBorrows"),
    borsh.u32("fuelPositions"),
    borsh.u32("fuelTaker"),
    borsh.u32("fuelMaker"),
    borsh.u64("ifStakedGovTokenAmount"),
    borsh.u32("lastFuelIfBonusUpdateTs"),
    borsh.array(borsh.u8(), 12, "padding"),
  ]);

  constructor(fields: UserStatsFields) {
    this.authority = fields.authority;
    this.referrer = fields.referrer;
    this.fees = new types.UserFees({ ...fields.fees });
    this.nextEpochTs = fields.nextEpochTs;
    this.makerVolume30d = fields.makerVolume30d;
    this.takerVolume30d = fields.takerVolume30d;
    this.fillerVolume30d = fields.fillerVolume30d;
    this.lastMakerVolume30dTs = fields.lastMakerVolume30dTs;
    this.lastTakerVolume30dTs = fields.lastTakerVolume30dTs;
    this.lastFillerVolume30dTs = fields.lastFillerVolume30dTs;
    this.ifStakedQuoteAssetAmount = fields.ifStakedQuoteAssetAmount;
    this.numberOfSubAccounts = fields.numberOfSubAccounts;
    this.numberOfSubAccountsCreated = fields.numberOfSubAccountsCreated;
    this.isReferrer = fields.isReferrer;
    this.disableUpdatePerpBidAskTwap = fields.disableUpdatePerpBidAskTwap;
    this.padding1 = fields.padding1;
    this.fuelInsurance = fields.fuelInsurance;
    this.fuelDeposits = fields.fuelDeposits;
    this.fuelBorrows = fields.fuelBorrows;
    this.fuelPositions = fields.fuelPositions;
    this.fuelTaker = fields.fuelTaker;
    this.fuelMaker = fields.fuelMaker;
    this.ifStakedGovTokenAmount = fields.ifStakedGovTokenAmount;
    this.lastFuelIfBonusUpdateTs = fields.lastFuelIfBonusUpdateTs;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<UserStats | null> {
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
  ): Promise<Array<UserStats | null>> {
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

  static decode(data: Buffer): UserStats {
    if (!data.slice(0, 8).equals(UserStats.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = UserStats.layout.decode(data.slice(8));

    return new UserStats({
      authority: dec.authority,
      referrer: dec.referrer,
      fees: types.UserFees.fromDecoded(dec.fees),
      nextEpochTs: dec.nextEpochTs,
      makerVolume30d: dec.makerVolume30d,
      takerVolume30d: dec.takerVolume30d,
      fillerVolume30d: dec.fillerVolume30d,
      lastMakerVolume30dTs: dec.lastMakerVolume30dTs,
      lastTakerVolume30dTs: dec.lastTakerVolume30dTs,
      lastFillerVolume30dTs: dec.lastFillerVolume30dTs,
      ifStakedQuoteAssetAmount: dec.ifStakedQuoteAssetAmount,
      numberOfSubAccounts: dec.numberOfSubAccounts,
      numberOfSubAccountsCreated: dec.numberOfSubAccountsCreated,
      isReferrer: dec.isReferrer,
      disableUpdatePerpBidAskTwap: dec.disableUpdatePerpBidAskTwap,
      padding1: dec.padding1,
      fuelInsurance: dec.fuelInsurance,
      fuelDeposits: dec.fuelDeposits,
      fuelBorrows: dec.fuelBorrows,
      fuelPositions: dec.fuelPositions,
      fuelTaker: dec.fuelTaker,
      fuelMaker: dec.fuelMaker,
      ifStakedGovTokenAmount: dec.ifStakedGovTokenAmount,
      lastFuelIfBonusUpdateTs: dec.lastFuelIfBonusUpdateTs,
      padding: dec.padding,
    });
  }

  toJSON(): UserStatsJSON {
    return {
      authority: this.authority.toString(),
      referrer: this.referrer.toString(),
      fees: this.fees.toJSON(),
      nextEpochTs: this.nextEpochTs.toString(),
      makerVolume30d: this.makerVolume30d.toString(),
      takerVolume30d: this.takerVolume30d.toString(),
      fillerVolume30d: this.fillerVolume30d.toString(),
      lastMakerVolume30dTs: this.lastMakerVolume30dTs.toString(),
      lastTakerVolume30dTs: this.lastTakerVolume30dTs.toString(),
      lastFillerVolume30dTs: this.lastFillerVolume30dTs.toString(),
      ifStakedQuoteAssetAmount: this.ifStakedQuoteAssetAmount.toString(),
      numberOfSubAccounts: this.numberOfSubAccounts,
      numberOfSubAccountsCreated: this.numberOfSubAccountsCreated,
      isReferrer: this.isReferrer,
      disableUpdatePerpBidAskTwap: this.disableUpdatePerpBidAskTwap,
      padding1: this.padding1,
      fuelInsurance: this.fuelInsurance,
      fuelDeposits: this.fuelDeposits,
      fuelBorrows: this.fuelBorrows,
      fuelPositions: this.fuelPositions,
      fuelTaker: this.fuelTaker,
      fuelMaker: this.fuelMaker,
      ifStakedGovTokenAmount: this.ifStakedGovTokenAmount.toString(),
      lastFuelIfBonusUpdateTs: this.lastFuelIfBonusUpdateTs,
      padding: this.padding,
    };
  }

  static fromJSON(obj: UserStatsJSON): UserStats {
    return new UserStats({
      authority: new PublicKey(obj.authority),
      referrer: new PublicKey(obj.referrer),
      fees: types.UserFees.fromJSON(obj.fees),
      nextEpochTs: new BN(obj.nextEpochTs),
      makerVolume30d: new BN(obj.makerVolume30d),
      takerVolume30d: new BN(obj.takerVolume30d),
      fillerVolume30d: new BN(obj.fillerVolume30d),
      lastMakerVolume30dTs: new BN(obj.lastMakerVolume30dTs),
      lastTakerVolume30dTs: new BN(obj.lastTakerVolume30dTs),
      lastFillerVolume30dTs: new BN(obj.lastFillerVolume30dTs),
      ifStakedQuoteAssetAmount: new BN(obj.ifStakedQuoteAssetAmount),
      numberOfSubAccounts: obj.numberOfSubAccounts,
      numberOfSubAccountsCreated: obj.numberOfSubAccountsCreated,
      isReferrer: obj.isReferrer,
      disableUpdatePerpBidAskTwap: obj.disableUpdatePerpBidAskTwap,
      padding1: obj.padding1,
      fuelInsurance: obj.fuelInsurance,
      fuelDeposits: obj.fuelDeposits,
      fuelBorrows: obj.fuelBorrows,
      fuelPositions: obj.fuelPositions,
      fuelTaker: obj.fuelTaker,
      fuelMaker: obj.fuelMaker,
      ifStakedGovTokenAmount: new BN(obj.ifStakedGovTokenAmount),
      lastFuelIfBonusUpdateTs: obj.lastFuelIfBonusUpdateTs,
      padding: obj.padding,
    });
  }
}
