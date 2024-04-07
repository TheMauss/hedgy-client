import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UserAccountFields {
  isInitialized: boolean;
  creationTime: BN;
  myWallet: PublicKey;
  myAffiliate: Array<number>;
  usedAffiliate: Array<number>;
  currentEpochVolume: BN;
  prevTradingVolume: BN;
  rebates: BN;
  lastTradeEpoch: BN;
  rebateTier: BN;
  userBetAmountBtc: BN;
  userBetAmountSol: BN;
  userBetAmountBonk: BN;
  userBetAmountPyth: BN;
  userBetAmountJup: BN;
  userBetAmountEth: BN;
  userBetAmountSui: BN;
  userBetAmountTia: BN;
  usdcUserBetAmountBtc: BN;
  usdcUserBetAmountSol: BN;
  usdcUserBetAmountBonk: BN;
  usdcUserBetAmountPyth: BN;
  usdcUserBetAmountJup: BN;
  usdcUserBetAmountEth: BN;
  usdcUserBetAmountSui: BN;
  usdcUserBetAmountTia: BN;
  userPoints: BN;
  ordersCollateral: BN;
  usdcOrdersCollateral: BN;
}

export interface UserAccountJSON {
  isInitialized: boolean;
  creationTime: string;
  myWallet: string;
  myAffiliate: Array<number>;
  usedAffiliate: Array<number>;
  currentEpochVolume: string;
  prevTradingVolume: string;
  rebates: string;
  lastTradeEpoch: string;
  rebateTier: string;
  userBetAmountBtc: string;
  userBetAmountSol: string;
  userBetAmountBonk: string;
  userBetAmountPyth: string;
  userBetAmountJup: string;
  userBetAmountEth: string;
  userBetAmountSui: string;
  userBetAmountTia: string;
  usdcUserBetAmountBtc: string;
  usdcUserBetAmountSol: string;
  usdcUserBetAmountBonk: string;
  usdcUserBetAmountPyth: string;
  usdcUserBetAmountJup: string;
  usdcUserBetAmountEth: string;
  usdcUserBetAmountSui: string;
  usdcUserBetAmountTia: string;
  userPoints: string;
  ordersCollateral: string;
  usdcOrdersCollateral: string;
}

export class UserAccount {
  readonly isInitialized: boolean;
  readonly creationTime: BN;
  readonly myWallet: PublicKey;
  readonly myAffiliate: Array<number>;
  readonly usedAffiliate: Array<number>;
  readonly currentEpochVolume: BN;
  readonly prevTradingVolume: BN;
  readonly rebates: BN;
  readonly lastTradeEpoch: BN;
  readonly rebateTier: BN;
  readonly userBetAmountBtc: BN;
  readonly userBetAmountSol: BN;
  readonly userBetAmountBonk: BN;
  readonly userBetAmountPyth: BN;
  readonly userBetAmountJup: BN;
  readonly userBetAmountEth: BN;
  readonly userBetAmountSui: BN;
  readonly userBetAmountTia: BN;
  readonly usdcUserBetAmountBtc: BN;
  readonly usdcUserBetAmountSol: BN;
  readonly usdcUserBetAmountBonk: BN;
  readonly usdcUserBetAmountPyth: BN;
  readonly usdcUserBetAmountJup: BN;
  readonly usdcUserBetAmountEth: BN;
  readonly usdcUserBetAmountSui: BN;
  readonly usdcUserBetAmountTia: BN;
  readonly userPoints: BN;
  readonly ordersCollateral: BN;
  readonly usdcOrdersCollateral: BN;

  static readonly discriminator = Buffer.from([
    211, 33, 136, 16, 186, 110, 242, 127,
  ]);

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.u64("creationTime"),
    borsh.publicKey("myWallet"),
    borsh.array(borsh.u8(), 8, "myAffiliate"),
    borsh.array(borsh.u8(), 8, "usedAffiliate"),
    borsh.u64("currentEpochVolume"),
    borsh.u64("prevTradingVolume"),
    borsh.u64("rebates"),
    borsh.u64("lastTradeEpoch"),
    borsh.u64("rebateTier"),
    borsh.u64("userBetAmountBtc"),
    borsh.u64("userBetAmountSol"),
    borsh.u64("userBetAmountBonk"),
    borsh.u64("userBetAmountPyth"),
    borsh.u64("userBetAmountJup"),
    borsh.u64("userBetAmountEth"),
    borsh.u64("userBetAmountSui"),
    borsh.u64("userBetAmountTia"),
    borsh.u64("usdcUserBetAmountBtc"),
    borsh.u64("usdcUserBetAmountSol"),
    borsh.u64("usdcUserBetAmountBonk"),
    borsh.u64("usdcUserBetAmountPyth"),
    borsh.u64("usdcUserBetAmountJup"),
    borsh.u64("usdcUserBetAmountEth"),
    borsh.u64("usdcUserBetAmountSui"),
    borsh.u64("usdcUserBetAmountTia"),
    borsh.u64("userPoints"),
    borsh.u64("ordersCollateral"),
    borsh.u64("usdcOrdersCollateral"),
  ]);

  constructor(fields: UserAccountFields) {
    this.isInitialized = fields.isInitialized;
    this.creationTime = fields.creationTime;
    this.myWallet = fields.myWallet;
    this.myAffiliate = fields.myAffiliate;
    this.usedAffiliate = fields.usedAffiliate;
    this.currentEpochVolume = fields.currentEpochVolume;
    this.prevTradingVolume = fields.prevTradingVolume;
    this.rebates = fields.rebates;
    this.lastTradeEpoch = fields.lastTradeEpoch;
    this.rebateTier = fields.rebateTier;
    this.userBetAmountBtc = fields.userBetAmountBtc;
    this.userBetAmountSol = fields.userBetAmountSol;
    this.userBetAmountBonk = fields.userBetAmountBonk;
    this.userBetAmountPyth = fields.userBetAmountPyth;
    this.userBetAmountJup = fields.userBetAmountJup;
    this.userBetAmountEth = fields.userBetAmountEth;
    this.userBetAmountSui = fields.userBetAmountSui;
    this.userBetAmountTia = fields.userBetAmountTia;
    this.usdcUserBetAmountBtc = fields.usdcUserBetAmountBtc;
    this.usdcUserBetAmountSol = fields.usdcUserBetAmountSol;
    this.usdcUserBetAmountBonk = fields.usdcUserBetAmountBonk;
    this.usdcUserBetAmountPyth = fields.usdcUserBetAmountPyth;
    this.usdcUserBetAmountJup = fields.usdcUserBetAmountJup;
    this.usdcUserBetAmountEth = fields.usdcUserBetAmountEth;
    this.usdcUserBetAmountSui = fields.usdcUserBetAmountSui;
    this.usdcUserBetAmountTia = fields.usdcUserBetAmountTia;
    this.userPoints = fields.userPoints;
    this.ordersCollateral = fields.ordersCollateral;
    this.usdcOrdersCollateral = fields.usdcOrdersCollateral;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<UserAccount | null> {
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
  ): Promise<Array<UserAccount | null>> {
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

  static decode(data: Buffer): UserAccount {
    if (!data.slice(0, 8).equals(UserAccount.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = UserAccount.layout.decode(data.slice(8));

    return new UserAccount({
      isInitialized: dec.isInitialized,
      creationTime: dec.creationTime,
      myWallet: dec.myWallet,
      myAffiliate: dec.myAffiliate,
      usedAffiliate: dec.usedAffiliate,
      currentEpochVolume: dec.currentEpochVolume,
      prevTradingVolume: dec.prevTradingVolume,
      rebates: dec.rebates,
      lastTradeEpoch: dec.lastTradeEpoch,
      rebateTier: dec.rebateTier,
      userBetAmountBtc: dec.userBetAmountBtc,
      userBetAmountSol: dec.userBetAmountSol,
      userBetAmountBonk: dec.userBetAmountBonk,
      userBetAmountPyth: dec.userBetAmountPyth,
      userBetAmountJup: dec.userBetAmountJup,
      userBetAmountEth: dec.userBetAmountEth,
      userBetAmountSui: dec.userBetAmountSui,
      userBetAmountTia: dec.userBetAmountTia,
      usdcUserBetAmountBtc: dec.usdcUserBetAmountBtc,
      usdcUserBetAmountSol: dec.usdcUserBetAmountSol,
      usdcUserBetAmountBonk: dec.usdcUserBetAmountBonk,
      usdcUserBetAmountPyth: dec.usdcUserBetAmountPyth,
      usdcUserBetAmountJup: dec.usdcUserBetAmountJup,
      usdcUserBetAmountEth: dec.usdcUserBetAmountEth,
      usdcUserBetAmountSui: dec.usdcUserBetAmountSui,
      usdcUserBetAmountTia: dec.usdcUserBetAmountTia,
      userPoints: dec.userPoints,
      ordersCollateral: dec.ordersCollateral,
      usdcOrdersCollateral: dec.usdcOrdersCollateral,
    });
  }

  toJSON(): UserAccountJSON {
    return {
      isInitialized: this.isInitialized,
      creationTime: this.creationTime.toString(),
      myWallet: this.myWallet.toString(),
      myAffiliate: this.myAffiliate,
      usedAffiliate: this.usedAffiliate,
      currentEpochVolume: this.currentEpochVolume.toString(),
      prevTradingVolume: this.prevTradingVolume.toString(),
      rebates: this.rebates.toString(),
      lastTradeEpoch: this.lastTradeEpoch.toString(),
      rebateTier: this.rebateTier.toString(),
      userBetAmountBtc: this.userBetAmountBtc.toString(),
      userBetAmountSol: this.userBetAmountSol.toString(),
      userBetAmountBonk: this.userBetAmountBonk.toString(),
      userBetAmountPyth: this.userBetAmountPyth.toString(),
      userBetAmountJup: this.userBetAmountJup.toString(),
      userBetAmountEth: this.userBetAmountEth.toString(),
      userBetAmountSui: this.userBetAmountSui.toString(),
      userBetAmountTia: this.userBetAmountTia.toString(),
      usdcUserBetAmountBtc: this.usdcUserBetAmountBtc.toString(),
      usdcUserBetAmountSol: this.usdcUserBetAmountSol.toString(),
      usdcUserBetAmountBonk: this.usdcUserBetAmountBonk.toString(),
      usdcUserBetAmountPyth: this.usdcUserBetAmountPyth.toString(),
      usdcUserBetAmountJup: this.usdcUserBetAmountJup.toString(),
      usdcUserBetAmountEth: this.usdcUserBetAmountEth.toString(),
      usdcUserBetAmountSui: this.usdcUserBetAmountSui.toString(),
      usdcUserBetAmountTia: this.usdcUserBetAmountTia.toString(),
      userPoints: this.userPoints.toString(),
      ordersCollateral: this.ordersCollateral.toString(),
      usdcOrdersCollateral: this.usdcOrdersCollateral.toString(),
    };
  }

  static fromJSON(obj: UserAccountJSON): UserAccount {
    return new UserAccount({
      isInitialized: obj.isInitialized,
      creationTime: new BN(obj.creationTime),
      myWallet: new PublicKey(obj.myWallet),
      myAffiliate: obj.myAffiliate,
      usedAffiliate: obj.usedAffiliate,
      currentEpochVolume: new BN(obj.currentEpochVolume),
      prevTradingVolume: new BN(obj.prevTradingVolume),
      rebates: new BN(obj.rebates),
      lastTradeEpoch: new BN(obj.lastTradeEpoch),
      rebateTier: new BN(obj.rebateTier),
      userBetAmountBtc: new BN(obj.userBetAmountBtc),
      userBetAmountSol: new BN(obj.userBetAmountSol),
      userBetAmountBonk: new BN(obj.userBetAmountBonk),
      userBetAmountPyth: new BN(obj.userBetAmountPyth),
      userBetAmountJup: new BN(obj.userBetAmountJup),
      userBetAmountEth: new BN(obj.userBetAmountEth),
      userBetAmountSui: new BN(obj.userBetAmountSui),
      userBetAmountTia: new BN(obj.userBetAmountTia),
      usdcUserBetAmountBtc: new BN(obj.usdcUserBetAmountBtc),
      usdcUserBetAmountSol: new BN(obj.usdcUserBetAmountSol),
      usdcUserBetAmountBonk: new BN(obj.usdcUserBetAmountBonk),
      usdcUserBetAmountPyth: new BN(obj.usdcUserBetAmountPyth),
      usdcUserBetAmountJup: new BN(obj.usdcUserBetAmountJup),
      usdcUserBetAmountEth: new BN(obj.usdcUserBetAmountEth),
      usdcUserBetAmountSui: new BN(obj.usdcUserBetAmountSui),
      usdcUserBetAmountTia: new BN(obj.usdcUserBetAmountTia),
      userPoints: new BN(obj.userPoints),
      ordersCollateral: new BN(obj.ordersCollateral),
      usdcOrdersCollateral: new BN(obj.usdcOrdersCollateral),
    });
  }
}
