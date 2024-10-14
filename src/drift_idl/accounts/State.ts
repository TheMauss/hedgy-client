import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface StateFields {
  admin: PublicKey;
  whitelistMint: PublicKey;
  discountMint: PublicKey;
  signer: PublicKey;
  srmVault: PublicKey;
  perpFeeStructure: types.FeeStructureFields;
  spotFeeStructure: types.FeeStructureFields;
  oracleGuardRails: types.OracleGuardRailsFields;
  numberOfAuthorities: BN;
  numberOfSubAccounts: BN;
  lpCooldownTime: BN;
  liquidationMarginBufferRatio: number;
  settlementDuration: number;
  numberOfMarkets: number;
  numberOfSpotMarkets: number;
  signerNonce: number;
  minPerpAuctionDuration: number;
  defaultMarketOrderTimeInForce: number;
  defaultSpotAuctionDuration: number;
  exchangeStatus: number;
  liquidationDuration: number;
  initialPctToLiquidate: number;
  maxNumberOfSubAccounts: number;
  maxInitializeUserFee: number;
  padding: Array<number>;
}

export interface StateJSON {
  admin: string;
  whitelistMint: string;
  discountMint: string;
  signer: string;
  srmVault: string;
  perpFeeStructure: types.FeeStructureJSON;
  spotFeeStructure: types.FeeStructureJSON;
  oracleGuardRails: types.OracleGuardRailsJSON;
  numberOfAuthorities: string;
  numberOfSubAccounts: string;
  lpCooldownTime: string;
  liquidationMarginBufferRatio: number;
  settlementDuration: number;
  numberOfMarkets: number;
  numberOfSpotMarkets: number;
  signerNonce: number;
  minPerpAuctionDuration: number;
  defaultMarketOrderTimeInForce: number;
  defaultSpotAuctionDuration: number;
  exchangeStatus: number;
  liquidationDuration: number;
  initialPctToLiquidate: number;
  maxNumberOfSubAccounts: number;
  maxInitializeUserFee: number;
  padding: Array<number>;
}

export class State {
  readonly admin: PublicKey;
  readonly whitelistMint: PublicKey;
  readonly discountMint: PublicKey;
  readonly signer: PublicKey;
  readonly srmVault: PublicKey;
  readonly perpFeeStructure: types.FeeStructure;
  readonly spotFeeStructure: types.FeeStructure;
  readonly oracleGuardRails: types.OracleGuardRails;
  readonly numberOfAuthorities: BN;
  readonly numberOfSubAccounts: BN;
  readonly lpCooldownTime: BN;
  readonly liquidationMarginBufferRatio: number;
  readonly settlementDuration: number;
  readonly numberOfMarkets: number;
  readonly numberOfSpotMarkets: number;
  readonly signerNonce: number;
  readonly minPerpAuctionDuration: number;
  readonly defaultMarketOrderTimeInForce: number;
  readonly defaultSpotAuctionDuration: number;
  readonly exchangeStatus: number;
  readonly liquidationDuration: number;
  readonly initialPctToLiquidate: number;
  readonly maxNumberOfSubAccounts: number;
  readonly maxInitializeUserFee: number;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    216, 146, 107, 94, 104, 75, 182, 177,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("admin"),
    borsh.publicKey("whitelistMint"),
    borsh.publicKey("discountMint"),
    borsh.publicKey("signer"),
    borsh.publicKey("srmVault"),
    types.FeeStructure.layout("perpFeeStructure"),
    types.FeeStructure.layout("spotFeeStructure"),
    types.OracleGuardRails.layout("oracleGuardRails"),
    borsh.u64("numberOfAuthorities"),
    borsh.u64("numberOfSubAccounts"),
    borsh.u64("lpCooldownTime"),
    borsh.u32("liquidationMarginBufferRatio"),
    borsh.u16("settlementDuration"),
    borsh.u16("numberOfMarkets"),
    borsh.u16("numberOfSpotMarkets"),
    borsh.u8("signerNonce"),
    borsh.u8("minPerpAuctionDuration"),
    borsh.u8("defaultMarketOrderTimeInForce"),
    borsh.u8("defaultSpotAuctionDuration"),
    borsh.u8("exchangeStatus"),
    borsh.u8("liquidationDuration"),
    borsh.u16("initialPctToLiquidate"),
    borsh.u16("maxNumberOfSubAccounts"),
    borsh.u16("maxInitializeUserFee"),
    borsh.array(borsh.u8(), 10, "padding"),
  ]);

  constructor(fields: StateFields) {
    this.admin = fields.admin;
    this.whitelistMint = fields.whitelistMint;
    this.discountMint = fields.discountMint;
    this.signer = fields.signer;
    this.srmVault = fields.srmVault;
    this.perpFeeStructure = new types.FeeStructure({
      ...fields.perpFeeStructure,
    });
    this.spotFeeStructure = new types.FeeStructure({
      ...fields.spotFeeStructure,
    });
    this.oracleGuardRails = new types.OracleGuardRails({
      ...fields.oracleGuardRails,
    });
    this.numberOfAuthorities = fields.numberOfAuthorities;
    this.numberOfSubAccounts = fields.numberOfSubAccounts;
    this.lpCooldownTime = fields.lpCooldownTime;
    this.liquidationMarginBufferRatio = fields.liquidationMarginBufferRatio;
    this.settlementDuration = fields.settlementDuration;
    this.numberOfMarkets = fields.numberOfMarkets;
    this.numberOfSpotMarkets = fields.numberOfSpotMarkets;
    this.signerNonce = fields.signerNonce;
    this.minPerpAuctionDuration = fields.minPerpAuctionDuration;
    this.defaultMarketOrderTimeInForce = fields.defaultMarketOrderTimeInForce;
    this.defaultSpotAuctionDuration = fields.defaultSpotAuctionDuration;
    this.exchangeStatus = fields.exchangeStatus;
    this.liquidationDuration = fields.liquidationDuration;
    this.initialPctToLiquidate = fields.initialPctToLiquidate;
    this.maxNumberOfSubAccounts = fields.maxNumberOfSubAccounts;
    this.maxInitializeUserFee = fields.maxInitializeUserFee;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<State | null> {
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
  ): Promise<Array<State | null>> {
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

  static decode(data: Buffer): State {
    if (!data.slice(0, 8).equals(State.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = State.layout.decode(data.slice(8));

    return new State({
      admin: dec.admin,
      whitelistMint: dec.whitelistMint,
      discountMint: dec.discountMint,
      signer: dec.signer,
      srmVault: dec.srmVault,
      perpFeeStructure: types.FeeStructure.fromDecoded(dec.perpFeeStructure),
      spotFeeStructure: types.FeeStructure.fromDecoded(dec.spotFeeStructure),
      oracleGuardRails: types.OracleGuardRails.fromDecoded(
        dec.oracleGuardRails
      ),
      numberOfAuthorities: dec.numberOfAuthorities,
      numberOfSubAccounts: dec.numberOfSubAccounts,
      lpCooldownTime: dec.lpCooldownTime,
      liquidationMarginBufferRatio: dec.liquidationMarginBufferRatio,
      settlementDuration: dec.settlementDuration,
      numberOfMarkets: dec.numberOfMarkets,
      numberOfSpotMarkets: dec.numberOfSpotMarkets,
      signerNonce: dec.signerNonce,
      minPerpAuctionDuration: dec.minPerpAuctionDuration,
      defaultMarketOrderTimeInForce: dec.defaultMarketOrderTimeInForce,
      defaultSpotAuctionDuration: dec.defaultSpotAuctionDuration,
      exchangeStatus: dec.exchangeStatus,
      liquidationDuration: dec.liquidationDuration,
      initialPctToLiquidate: dec.initialPctToLiquidate,
      maxNumberOfSubAccounts: dec.maxNumberOfSubAccounts,
      maxInitializeUserFee: dec.maxInitializeUserFee,
      padding: dec.padding,
    });
  }

  toJSON(): StateJSON {
    return {
      admin: this.admin.toString(),
      whitelistMint: this.whitelistMint.toString(),
      discountMint: this.discountMint.toString(),
      signer: this.signer.toString(),
      srmVault: this.srmVault.toString(),
      perpFeeStructure: this.perpFeeStructure.toJSON(),
      spotFeeStructure: this.spotFeeStructure.toJSON(),
      oracleGuardRails: this.oracleGuardRails.toJSON(),
      numberOfAuthorities: this.numberOfAuthorities.toString(),
      numberOfSubAccounts: this.numberOfSubAccounts.toString(),
      lpCooldownTime: this.lpCooldownTime.toString(),
      liquidationMarginBufferRatio: this.liquidationMarginBufferRatio,
      settlementDuration: this.settlementDuration,
      numberOfMarkets: this.numberOfMarkets,
      numberOfSpotMarkets: this.numberOfSpotMarkets,
      signerNonce: this.signerNonce,
      minPerpAuctionDuration: this.minPerpAuctionDuration,
      defaultMarketOrderTimeInForce: this.defaultMarketOrderTimeInForce,
      defaultSpotAuctionDuration: this.defaultSpotAuctionDuration,
      exchangeStatus: this.exchangeStatus,
      liquidationDuration: this.liquidationDuration,
      initialPctToLiquidate: this.initialPctToLiquidate,
      maxNumberOfSubAccounts: this.maxNumberOfSubAccounts,
      maxInitializeUserFee: this.maxInitializeUserFee,
      padding: this.padding,
    };
  }

  static fromJSON(obj: StateJSON): State {
    return new State({
      admin: new PublicKey(obj.admin),
      whitelistMint: new PublicKey(obj.whitelistMint),
      discountMint: new PublicKey(obj.discountMint),
      signer: new PublicKey(obj.signer),
      srmVault: new PublicKey(obj.srmVault),
      perpFeeStructure: types.FeeStructure.fromJSON(obj.perpFeeStructure),
      spotFeeStructure: types.FeeStructure.fromJSON(obj.spotFeeStructure),
      oracleGuardRails: types.OracleGuardRails.fromJSON(obj.oracleGuardRails),
      numberOfAuthorities: new BN(obj.numberOfAuthorities),
      numberOfSubAccounts: new BN(obj.numberOfSubAccounts),
      lpCooldownTime: new BN(obj.lpCooldownTime),
      liquidationMarginBufferRatio: obj.liquidationMarginBufferRatio,
      settlementDuration: obj.settlementDuration,
      numberOfMarkets: obj.numberOfMarkets,
      numberOfSpotMarkets: obj.numberOfSpotMarkets,
      signerNonce: obj.signerNonce,
      minPerpAuctionDuration: obj.minPerpAuctionDuration,
      defaultMarketOrderTimeInForce: obj.defaultMarketOrderTimeInForce,
      defaultSpotAuctionDuration: obj.defaultSpotAuctionDuration,
      exchangeStatus: obj.exchangeStatus,
      liquidationDuration: obj.liquidationDuration,
      initialPctToLiquidate: obj.initialPctToLiquidate,
      maxNumberOfSubAccounts: obj.maxNumberOfSubAccounts,
      maxInitializeUserFee: obj.maxInitializeUserFee,
      padding: obj.padding,
    });
  }
}
