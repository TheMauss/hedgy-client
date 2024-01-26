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
  userBetAmountBtc: BN;
  userBetAmountSol: BN;
  userBinaryBetAmountBtc: BN;
  userBinaryBetAmountSol: BN;
  userBetAmountBonk: BN;
  userBinaryBetAmountBonk: BN;
  userBetAmountPyth: BN;
  userBinaryBetAmountPyth: BN;
  userBetAmountJup: BN;
  userBinaryBetAmountJup: BN;
  totalFees: BN;
  currentEpochVolume: BN;
  prevTradingVolume: BN;
  rebates: BN;
  lastTradeEpoch: BN;
  rebateTier: BN;
  userBetAmountEth: BN;
  userBetAmountSui: BN;
  userBetAmountTia: BN;
}

export interface UserAccountJSON {
  isInitialized: boolean;
  creationTime: string;
  myWallet: string;
  myAffiliate: Array<number>;
  usedAffiliate: Array<number>;
  userBetAmountBtc: string;
  userBetAmountSol: string;
  userBinaryBetAmountBtc: string;
  userBinaryBetAmountSol: string;
  userBetAmountBonk: string;
  userBinaryBetAmountBonk: string;
  userBetAmountPyth: string;
  userBinaryBetAmountPyth: string;
  userBetAmountJup: string;
  userBinaryBetAmountJup: string;
  totalFees: string;
  currentEpochVolume: string;
  prevTradingVolume: string;
  rebates: string;
  lastTradeEpoch: string;
  rebateTier: string;
  userBetAmountEth: string;
  userBetAmountSui: string;
  userBetAmountTia: string;
}

export class UserAccount {
  readonly isInitialized: boolean;
  readonly creationTime: BN;
  readonly myWallet: PublicKey;
  readonly myAffiliate: Array<number>;
  readonly usedAffiliate: Array<number>;
  readonly userBetAmountBtc: BN;
  readonly userBetAmountSol: BN;
  readonly userBinaryBetAmountBtc: BN;
  readonly userBinaryBetAmountSol: BN;
  readonly userBetAmountBonk: BN;
  readonly userBinaryBetAmountBonk: BN;
  readonly userBetAmountPyth: BN;
  readonly userBinaryBetAmountPyth: BN;
  readonly userBetAmountJup: BN;
  readonly userBinaryBetAmountJup: BN;
  readonly totalFees: BN;
  readonly currentEpochVolume: BN;
  readonly prevTradingVolume: BN;
  readonly rebates: BN;
  readonly lastTradeEpoch: BN;
  readonly rebateTier: BN;
  readonly userBetAmountEth: BN;
  readonly userBetAmountSui: BN;
  readonly userBetAmountTia: BN;

  static readonly discriminator = Buffer.from([
    211, 33, 136, 16, 186, 110, 242, 127,
  ]);

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.u64("creationTime"),
    borsh.publicKey("myWallet"),
    borsh.array(borsh.u8(), 8, "myAffiliate"),
    borsh.array(borsh.u8(), 8, "usedAffiliate"),
    borsh.u64("userBetAmountBtc"),
    borsh.u64("userBetAmountSol"),
    borsh.u64("userBinaryBetAmountBtc"),
    borsh.u64("userBinaryBetAmountSol"),
    borsh.u64("userBetAmountBonk"),
    borsh.u64("userBinaryBetAmountBonk"),
    borsh.u64("userBetAmountPyth"),
    borsh.u64("userBinaryBetAmountPyth"),
    borsh.u64("userBetAmountJup"),
    borsh.u64("userBinaryBetAmountJup"),
    borsh.u64("totalFees"),
    borsh.u64("currentEpochVolume"),
    borsh.u64("prevTradingVolume"),
    borsh.u64("rebates"),
    borsh.u64("lastTradeEpoch"),
    borsh.u64("rebateTier"),
    borsh.u64("userBetAmountEth"),
    borsh.u64("userBetAmountSui"),
    borsh.u64("userBetAmountTia"),
  ]);

  constructor(fields: UserAccountFields) {
    this.isInitialized = fields.isInitialized;
    this.creationTime = fields.creationTime;
    this.myWallet = fields.myWallet;
    this.myAffiliate = fields.myAffiliate;
    this.usedAffiliate = fields.usedAffiliate;
    this.userBetAmountBtc = fields.userBetAmountBtc;
    this.userBetAmountSol = fields.userBetAmountSol;
    this.userBinaryBetAmountBtc = fields.userBinaryBetAmountBtc;
    this.userBinaryBetAmountSol = fields.userBinaryBetAmountSol;
    this.userBetAmountBonk = fields.userBetAmountBonk;
    this.userBinaryBetAmountBonk = fields.userBinaryBetAmountBonk;
    this.userBetAmountPyth = fields.userBetAmountPyth;
    this.userBinaryBetAmountPyth = fields.userBinaryBetAmountPyth;
    this.userBetAmountJup = fields.userBetAmountJup;
    this.userBinaryBetAmountJup = fields.userBinaryBetAmountJup;
    this.totalFees = fields.totalFees;
    this.currentEpochVolume = fields.currentEpochVolume;
    this.prevTradingVolume = fields.prevTradingVolume;
    this.rebates = fields.rebates;
    this.lastTradeEpoch = fields.lastTradeEpoch;
    this.rebateTier = fields.rebateTier;
    this.userBetAmountEth = fields.userBetAmountEth;
    this.userBetAmountSui = fields.userBetAmountSui;
    this.userBetAmountTia = fields.userBetAmountTia;
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
      userBetAmountBtc: dec.userBetAmountBtc,
      userBetAmountSol: dec.userBetAmountSol,
      userBinaryBetAmountBtc: dec.userBinaryBetAmountBtc,
      userBinaryBetAmountSol: dec.userBinaryBetAmountSol,
      userBetAmountBonk: dec.userBetAmountBonk,
      userBinaryBetAmountBonk: dec.userBinaryBetAmountBonk,
      userBetAmountPyth: dec.userBetAmountPyth,
      userBinaryBetAmountPyth: dec.userBinaryBetAmountPyth,
      userBetAmountJup: dec.userBetAmountJup,
      userBinaryBetAmountJup: dec.userBinaryBetAmountJup,
      totalFees: dec.totalFees,
      currentEpochVolume: dec.currentEpochVolume,
      prevTradingVolume: dec.prevTradingVolume,
      rebates: dec.rebates,
      lastTradeEpoch: dec.lastTradeEpoch,
      rebateTier: dec.rebateTier,
      userBetAmountEth: dec.userBetAmountEth,
      userBetAmountSui: dec.userBetAmountSui,
      userBetAmountTia: dec.userBetAmountTia,
    });
  }

  toJSON(): UserAccountJSON {
    return {
      isInitialized: this.isInitialized,
      creationTime: this.creationTime.toString(),
      myWallet: this.myWallet.toString(),
      myAffiliate: this.myAffiliate,
      usedAffiliate: this.usedAffiliate,
      userBetAmountBtc: this.userBetAmountBtc.toString(),
      userBetAmountSol: this.userBetAmountSol.toString(),
      userBinaryBetAmountBtc: this.userBinaryBetAmountBtc.toString(),
      userBinaryBetAmountSol: this.userBinaryBetAmountSol.toString(),
      userBetAmountBonk: this.userBetAmountBonk.toString(),
      userBinaryBetAmountBonk: this.userBinaryBetAmountBonk.toString(),
      userBetAmountPyth: this.userBetAmountPyth.toString(),
      userBinaryBetAmountPyth: this.userBinaryBetAmountPyth.toString(),
      userBetAmountJup: this.userBetAmountJup.toString(),
      userBinaryBetAmountJup: this.userBinaryBetAmountJup.toString(),
      totalFees: this.totalFees.toString(),
      currentEpochVolume: this.currentEpochVolume.toString(),
      prevTradingVolume: this.prevTradingVolume.toString(),
      rebates: this.rebates.toString(),
      lastTradeEpoch: this.lastTradeEpoch.toString(),
      rebateTier: this.rebateTier.toString(),
      userBetAmountEth: this.userBetAmountEth.toString(),
      userBetAmountSui: this.userBetAmountSui.toString(),
      userBetAmountTia: this.userBetAmountTia.toString(),
    };
  }

  static fromJSON(obj: UserAccountJSON): UserAccount {
    return new UserAccount({
      isInitialized: obj.isInitialized,
      creationTime: new BN(obj.creationTime),
      myWallet: new PublicKey(obj.myWallet),
      myAffiliate: obj.myAffiliate,
      usedAffiliate: obj.usedAffiliate,
      userBetAmountBtc: new BN(obj.userBetAmountBtc),
      userBetAmountSol: new BN(obj.userBetAmountSol),
      userBinaryBetAmountBtc: new BN(obj.userBinaryBetAmountBtc),
      userBinaryBetAmountSol: new BN(obj.userBinaryBetAmountSol),
      userBetAmountBonk: new BN(obj.userBetAmountBonk),
      userBinaryBetAmountBonk: new BN(obj.userBinaryBetAmountBonk),
      userBetAmountPyth: new BN(obj.userBetAmountPyth),
      userBinaryBetAmountPyth: new BN(obj.userBinaryBetAmountPyth),
      userBetAmountJup: new BN(obj.userBetAmountJup),
      userBinaryBetAmountJup: new BN(obj.userBinaryBetAmountJup),
      totalFees: new BN(obj.totalFees),
      currentEpochVolume: new BN(obj.currentEpochVolume),
      prevTradingVolume: new BN(obj.prevTradingVolume),
      rebates: new BN(obj.rebates),
      lastTradeEpoch: new BN(obj.lastTradeEpoch),
      rebateTier: new BN(obj.rebateTier),
      userBetAmountEth: new BN(obj.userBetAmountEth),
      userBetAmountSui: new BN(obj.userBetAmountSui),
      userBetAmountTia: new BN(obj.userBetAmountTia),
    });
  }
}
