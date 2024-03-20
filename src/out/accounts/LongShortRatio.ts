import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface LongShortRatioFields {
  isInitialized: boolean;
  solLong: BN;
  solShort: BN;
  btcLong: BN;
  btcShort: BN;
  solLong1: BN;
  solShort1: BN;
  bonkPrice: BN;
  pythPrice: BN;
  jupPrice: BN;
  ethPrice: BN;
  suiPrice: BN;
  tiaPrice: BN;
  solLong240: BN;
  solShort240: BN;
  btcLong1: BN;
  btcShort1: BN;
  solPrice: BN;
  btcPrice: BN;
  btcLong15: BN;
  btcShort15: BN;
  btcLong60: BN;
  btcShort60: BN;
  btcLong240: BN;
  btcShort240: BN;
  totalCollateral: BN;
  longCollateral: BN;
  shortCollateral: BN;
  bonkLong: BN;
  bonkShort: BN;
  bonkLong1: BN;
  bonkShort1: BN;
  pythLong: BN;
  pythShort: BN;
  jupLong: BN;
  jupShort: BN;
  ethLong: BN;
  ethShort: BN;
  suiLong: BN;
  suiShort: BN;
  tiaLong: BN;
  tiaShort: BN;
  timestamp: BN;
  usdcSolLong1: BN;
  usdcSolShort1: BN;
  usdcBtcLong1: BN;
  usdcBtcShort1: BN;
  usdcTotalCollateral: BN;
  usdcLongCollateral: BN;
  usdcShortCollateral: BN;
  usdcSolLong: BN;
  usdcSolShort: BN;
  usdcBtcLong: BN;
  usdcBtcShort: BN;
  usdcBonkLong: BN;
  usdcBonkShort: BN;
  usdcPythLong: BN;
  usdcPythShort: BN;
  usdcJupLong: BN;
  usdcJupShort: BN;
  usdcEthLong: BN;
  usdcEthShort: BN;
  usdcSuiLong: BN;
  usdcSuiShort: BN;
  usdcTiaLong: BN;
  usdcTiaShort: BN;
  ordersCollateral: BN;
  usdcOrdersCollateral: BN;
}

export interface LongShortRatioJSON {
  isInitialized: boolean;
  solLong: string;
  solShort: string;
  btcLong: string;
  btcShort: string;
  solLong1: string;
  solShort1: string;
  bonkPrice: string;
  pythPrice: string;
  jupPrice: string;
  ethPrice: string;
  suiPrice: string;
  tiaPrice: string;
  solLong240: string;
  solShort240: string;
  btcLong1: string;
  btcShort1: string;
  solPrice: string;
  btcPrice: string;
  btcLong15: string;
  btcShort15: string;
  btcLong60: string;
  btcShort60: string;
  btcLong240: string;
  btcShort240: string;
  totalCollateral: string;
  longCollateral: string;
  shortCollateral: string;
  bonkLong: string;
  bonkShort: string;
  bonkLong1: string;
  bonkShort1: string;
  pythLong: string;
  pythShort: string;
  jupLong: string;
  jupShort: string;
  ethLong: string;
  ethShort: string;
  suiLong: string;
  suiShort: string;
  tiaLong: string;
  tiaShort: string;
  timestamp: string;
  usdcSolLong1: string;
  usdcSolShort1: string;
  usdcBtcLong1: string;
  usdcBtcShort1: string;
  usdcTotalCollateral: string;
  usdcLongCollateral: string;
  usdcShortCollateral: string;
  usdcSolLong: string;
  usdcSolShort: string;
  usdcBtcLong: string;
  usdcBtcShort: string;
  usdcBonkLong: string;
  usdcBonkShort: string;
  usdcPythLong: string;
  usdcPythShort: string;
  usdcJupLong: string;
  usdcJupShort: string;
  usdcEthLong: string;
  usdcEthShort: string;
  usdcSuiLong: string;
  usdcSuiShort: string;
  usdcTiaLong: string;
  usdcTiaShort: string;
  ordersCollateral: string;
  usdcOrdersCollateral: string;
}

export class LongShortRatio {
  readonly isInitialized: boolean;
  readonly solLong: BN;
  readonly solShort: BN;
  readonly btcLong: BN;
  readonly btcShort: BN;
  readonly solLong1: BN;
  readonly solShort1: BN;
  readonly bonkPrice: BN;
  readonly pythPrice: BN;
  readonly jupPrice: BN;
  readonly ethPrice: BN;
  readonly suiPrice: BN;
  readonly tiaPrice: BN;
  readonly solLong240: BN;
  readonly solShort240: BN;
  readonly btcLong1: BN;
  readonly btcShort1: BN;
  readonly solPrice: BN;
  readonly btcPrice: BN;
  readonly btcLong15: BN;
  readonly btcShort15: BN;
  readonly btcLong60: BN;
  readonly btcShort60: BN;
  readonly btcLong240: BN;
  readonly btcShort240: BN;
  readonly totalCollateral: BN;
  readonly longCollateral: BN;
  readonly shortCollateral: BN;
  readonly bonkLong: BN;
  readonly bonkShort: BN;
  readonly bonkLong1: BN;
  readonly bonkShort1: BN;
  readonly pythLong: BN;
  readonly pythShort: BN;
  readonly jupLong: BN;
  readonly jupShort: BN;
  readonly ethLong: BN;
  readonly ethShort: BN;
  readonly suiLong: BN;
  readonly suiShort: BN;
  readonly tiaLong: BN;
  readonly tiaShort: BN;
  readonly timestamp: BN;
  readonly usdcSolLong1: BN;
  readonly usdcSolShort1: BN;
  readonly usdcBtcLong1: BN;
  readonly usdcBtcShort1: BN;
  readonly usdcTotalCollateral: BN;
  readonly usdcLongCollateral: BN;
  readonly usdcShortCollateral: BN;
  readonly usdcSolLong: BN;
  readonly usdcSolShort: BN;
  readonly usdcBtcLong: BN;
  readonly usdcBtcShort: BN;
  readonly usdcBonkLong: BN;
  readonly usdcBonkShort: BN;
  readonly usdcPythLong: BN;
  readonly usdcPythShort: BN;
  readonly usdcJupLong: BN;
  readonly usdcJupShort: BN;
  readonly usdcEthLong: BN;
  readonly usdcEthShort: BN;
  readonly usdcSuiLong: BN;
  readonly usdcSuiShort: BN;
  readonly usdcTiaLong: BN;
  readonly usdcTiaShort: BN;
  readonly ordersCollateral: BN;
  readonly usdcOrdersCollateral: BN;

  static readonly discriminator = Buffer.from([
    18, 172, 89, 131, 240, 106, 141, 203,
  ]);

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.u64("solLong"),
    borsh.u64("solShort"),
    borsh.u64("btcLong"),
    borsh.u64("btcShort"),
    borsh.u64("solLong1"),
    borsh.u64("solShort1"),
    borsh.i64("bonkPrice"),
    borsh.i64("pythPrice"),
    borsh.i64("jupPrice"),
    borsh.i64("ethPrice"),
    borsh.i64("suiPrice"),
    borsh.i64("tiaPrice"),
    borsh.u64("solLong240"),
    borsh.u64("solShort240"),
    borsh.u64("btcLong1"),
    borsh.u64("btcShort1"),
    borsh.i64("solPrice"),
    borsh.i64("btcPrice"),
    borsh.u64("btcLong15"),
    borsh.u64("btcShort15"),
    borsh.u64("btcLong60"),
    borsh.u64("btcShort60"),
    borsh.u64("btcLong240"),
    borsh.u64("btcShort240"),
    borsh.u64("totalCollateral"),
    borsh.u64("longCollateral"),
    borsh.u64("shortCollateral"),
    borsh.u64("bonkLong"),
    borsh.u64("bonkShort"),
    borsh.u64("bonkLong1"),
    borsh.u64("bonkShort1"),
    borsh.u64("pythLong"),
    borsh.u64("pythShort"),
    borsh.u64("jupLong"),
    borsh.u64("jupShort"),
    borsh.u64("ethLong"),
    borsh.u64("ethShort"),
    borsh.u64("suiLong"),
    borsh.u64("suiShort"),
    borsh.u64("tiaLong"),
    borsh.u64("tiaShort"),
    borsh.i64("timestamp"),
    borsh.u64("usdcSolLong1"),
    borsh.u64("usdcSolShort1"),
    borsh.u64("usdcBtcLong1"),
    borsh.u64("usdcBtcShort1"),
    borsh.u64("usdcTotalCollateral"),
    borsh.u64("usdcLongCollateral"),
    borsh.u64("usdcShortCollateral"),
    borsh.u64("usdcSolLong"),
    borsh.u64("usdcSolShort"),
    borsh.u64("usdcBtcLong"),
    borsh.u64("usdcBtcShort"),
    borsh.u64("usdcBonkLong"),
    borsh.u64("usdcBonkShort"),
    borsh.u64("usdcPythLong"),
    borsh.u64("usdcPythShort"),
    borsh.u64("usdcJupLong"),
    borsh.u64("usdcJupShort"),
    borsh.u64("usdcEthLong"),
    borsh.u64("usdcEthShort"),
    borsh.u64("usdcSuiLong"),
    borsh.u64("usdcSuiShort"),
    borsh.u64("usdcTiaLong"),
    borsh.u64("usdcTiaShort"),
    borsh.u64("ordersCollateral"),
    borsh.u64("usdcOrdersCollateral"),
  ]);

  constructor(fields: LongShortRatioFields) {
    this.isInitialized = fields.isInitialized;
    this.solLong = fields.solLong;
    this.solShort = fields.solShort;
    this.btcLong = fields.btcLong;
    this.btcShort = fields.btcShort;
    this.solLong1 = fields.solLong1;
    this.solShort1 = fields.solShort1;
    this.bonkPrice = fields.bonkPrice;
    this.pythPrice = fields.pythPrice;
    this.jupPrice = fields.jupPrice;
    this.ethPrice = fields.ethPrice;
    this.suiPrice = fields.suiPrice;
    this.tiaPrice = fields.tiaPrice;
    this.solLong240 = fields.solLong240;
    this.solShort240 = fields.solShort240;
    this.btcLong1 = fields.btcLong1;
    this.btcShort1 = fields.btcShort1;
    this.solPrice = fields.solPrice;
    this.btcPrice = fields.btcPrice;
    this.btcLong15 = fields.btcLong15;
    this.btcShort15 = fields.btcShort15;
    this.btcLong60 = fields.btcLong60;
    this.btcShort60 = fields.btcShort60;
    this.btcLong240 = fields.btcLong240;
    this.btcShort240 = fields.btcShort240;
    this.totalCollateral = fields.totalCollateral;
    this.longCollateral = fields.longCollateral;
    this.shortCollateral = fields.shortCollateral;
    this.bonkLong = fields.bonkLong;
    this.bonkShort = fields.bonkShort;
    this.bonkLong1 = fields.bonkLong1;
    this.bonkShort1 = fields.bonkShort1;
    this.pythLong = fields.pythLong;
    this.pythShort = fields.pythShort;
    this.jupLong = fields.jupLong;
    this.jupShort = fields.jupShort;
    this.ethLong = fields.ethLong;
    this.ethShort = fields.ethShort;
    this.suiLong = fields.suiLong;
    this.suiShort = fields.suiShort;
    this.tiaLong = fields.tiaLong;
    this.tiaShort = fields.tiaShort;
    this.timestamp = fields.timestamp;
    this.usdcSolLong1 = fields.usdcSolLong1;
    this.usdcSolShort1 = fields.usdcSolShort1;
    this.usdcBtcLong1 = fields.usdcBtcLong1;
    this.usdcBtcShort1 = fields.usdcBtcShort1;
    this.usdcTotalCollateral = fields.usdcTotalCollateral;
    this.usdcLongCollateral = fields.usdcLongCollateral;
    this.usdcShortCollateral = fields.usdcShortCollateral;
    this.usdcSolLong = fields.usdcSolLong;
    this.usdcSolShort = fields.usdcSolShort;
    this.usdcBtcLong = fields.usdcBtcLong;
    this.usdcBtcShort = fields.usdcBtcShort;
    this.usdcBonkLong = fields.usdcBonkLong;
    this.usdcBonkShort = fields.usdcBonkShort;
    this.usdcPythLong = fields.usdcPythLong;
    this.usdcPythShort = fields.usdcPythShort;
    this.usdcJupLong = fields.usdcJupLong;
    this.usdcJupShort = fields.usdcJupShort;
    this.usdcEthLong = fields.usdcEthLong;
    this.usdcEthShort = fields.usdcEthShort;
    this.usdcSuiLong = fields.usdcSuiLong;
    this.usdcSuiShort = fields.usdcSuiShort;
    this.usdcTiaLong = fields.usdcTiaLong;
    this.usdcTiaShort = fields.usdcTiaShort;
    this.ordersCollateral = fields.ordersCollateral;
    this.usdcOrdersCollateral = fields.usdcOrdersCollateral;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<LongShortRatio | null> {
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
  ): Promise<Array<LongShortRatio | null>> {
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

  static decode(data: Buffer): LongShortRatio {
    if (!data.slice(0, 8).equals(LongShortRatio.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = LongShortRatio.layout.decode(data.slice(8));

    return new LongShortRatio({
      isInitialized: dec.isInitialized,
      solLong: dec.solLong,
      solShort: dec.solShort,
      btcLong: dec.btcLong,
      btcShort: dec.btcShort,
      solLong1: dec.solLong1,
      solShort1: dec.solShort1,
      bonkPrice: dec.bonkPrice,
      pythPrice: dec.pythPrice,
      jupPrice: dec.jupPrice,
      ethPrice: dec.ethPrice,
      suiPrice: dec.suiPrice,
      tiaPrice: dec.tiaPrice,
      solLong240: dec.solLong240,
      solShort240: dec.solShort240,
      btcLong1: dec.btcLong1,
      btcShort1: dec.btcShort1,
      solPrice: dec.solPrice,
      btcPrice: dec.btcPrice,
      btcLong15: dec.btcLong15,
      btcShort15: dec.btcShort15,
      btcLong60: dec.btcLong60,
      btcShort60: dec.btcShort60,
      btcLong240: dec.btcLong240,
      btcShort240: dec.btcShort240,
      totalCollateral: dec.totalCollateral,
      longCollateral: dec.longCollateral,
      shortCollateral: dec.shortCollateral,
      bonkLong: dec.bonkLong,
      bonkShort: dec.bonkShort,
      bonkLong1: dec.bonkLong1,
      bonkShort1: dec.bonkShort1,
      pythLong: dec.pythLong,
      pythShort: dec.pythShort,
      jupLong: dec.jupLong,
      jupShort: dec.jupShort,
      ethLong: dec.ethLong,
      ethShort: dec.ethShort,
      suiLong: dec.suiLong,
      suiShort: dec.suiShort,
      tiaLong: dec.tiaLong,
      tiaShort: dec.tiaShort,
      timestamp: dec.timestamp,
      usdcSolLong1: dec.usdcSolLong1,
      usdcSolShort1: dec.usdcSolShort1,
      usdcBtcLong1: dec.usdcBtcLong1,
      usdcBtcShort1: dec.usdcBtcShort1,
      usdcTotalCollateral: dec.usdcTotalCollateral,
      usdcLongCollateral: dec.usdcLongCollateral,
      usdcShortCollateral: dec.usdcShortCollateral,
      usdcSolLong: dec.usdcSolLong,
      usdcSolShort: dec.usdcSolShort,
      usdcBtcLong: dec.usdcBtcLong,
      usdcBtcShort: dec.usdcBtcShort,
      usdcBonkLong: dec.usdcBonkLong,
      usdcBonkShort: dec.usdcBonkShort,
      usdcPythLong: dec.usdcPythLong,
      usdcPythShort: dec.usdcPythShort,
      usdcJupLong: dec.usdcJupLong,
      usdcJupShort: dec.usdcJupShort,
      usdcEthLong: dec.usdcEthLong,
      usdcEthShort: dec.usdcEthShort,
      usdcSuiLong: dec.usdcSuiLong,
      usdcSuiShort: dec.usdcSuiShort,
      usdcTiaLong: dec.usdcTiaLong,
      usdcTiaShort: dec.usdcTiaShort,
      ordersCollateral: dec.ordersCollateral,
      usdcOrdersCollateral: dec.usdcOrdersCollateral,
    });
  }

  toJSON(): LongShortRatioJSON {
    return {
      isInitialized: this.isInitialized,
      solLong: this.solLong.toString(),
      solShort: this.solShort.toString(),
      btcLong: this.btcLong.toString(),
      btcShort: this.btcShort.toString(),
      solLong1: this.solLong1.toString(),
      solShort1: this.solShort1.toString(),
      bonkPrice: this.bonkPrice.toString(),
      pythPrice: this.pythPrice.toString(),
      jupPrice: this.jupPrice.toString(),
      ethPrice: this.ethPrice.toString(),
      suiPrice: this.suiPrice.toString(),
      tiaPrice: this.tiaPrice.toString(),
      solLong240: this.solLong240.toString(),
      solShort240: this.solShort240.toString(),
      btcLong1: this.btcLong1.toString(),
      btcShort1: this.btcShort1.toString(),
      solPrice: this.solPrice.toString(),
      btcPrice: this.btcPrice.toString(),
      btcLong15: this.btcLong15.toString(),
      btcShort15: this.btcShort15.toString(),
      btcLong60: this.btcLong60.toString(),
      btcShort60: this.btcShort60.toString(),
      btcLong240: this.btcLong240.toString(),
      btcShort240: this.btcShort240.toString(),
      totalCollateral: this.totalCollateral.toString(),
      longCollateral: this.longCollateral.toString(),
      shortCollateral: this.shortCollateral.toString(),
      bonkLong: this.bonkLong.toString(),
      bonkShort: this.bonkShort.toString(),
      bonkLong1: this.bonkLong1.toString(),
      bonkShort1: this.bonkShort1.toString(),
      pythLong: this.pythLong.toString(),
      pythShort: this.pythShort.toString(),
      jupLong: this.jupLong.toString(),
      jupShort: this.jupShort.toString(),
      ethLong: this.ethLong.toString(),
      ethShort: this.ethShort.toString(),
      suiLong: this.suiLong.toString(),
      suiShort: this.suiShort.toString(),
      tiaLong: this.tiaLong.toString(),
      tiaShort: this.tiaShort.toString(),
      timestamp: this.timestamp.toString(),
      usdcSolLong1: this.usdcSolLong1.toString(),
      usdcSolShort1: this.usdcSolShort1.toString(),
      usdcBtcLong1: this.usdcBtcLong1.toString(),
      usdcBtcShort1: this.usdcBtcShort1.toString(),
      usdcTotalCollateral: this.usdcTotalCollateral.toString(),
      usdcLongCollateral: this.usdcLongCollateral.toString(),
      usdcShortCollateral: this.usdcShortCollateral.toString(),
      usdcSolLong: this.usdcSolLong.toString(),
      usdcSolShort: this.usdcSolShort.toString(),
      usdcBtcLong: this.usdcBtcLong.toString(),
      usdcBtcShort: this.usdcBtcShort.toString(),
      usdcBonkLong: this.usdcBonkLong.toString(),
      usdcBonkShort: this.usdcBonkShort.toString(),
      usdcPythLong: this.usdcPythLong.toString(),
      usdcPythShort: this.usdcPythShort.toString(),
      usdcJupLong: this.usdcJupLong.toString(),
      usdcJupShort: this.usdcJupShort.toString(),
      usdcEthLong: this.usdcEthLong.toString(),
      usdcEthShort: this.usdcEthShort.toString(),
      usdcSuiLong: this.usdcSuiLong.toString(),
      usdcSuiShort: this.usdcSuiShort.toString(),
      usdcTiaLong: this.usdcTiaLong.toString(),
      usdcTiaShort: this.usdcTiaShort.toString(),
      ordersCollateral: this.ordersCollateral.toString(),
      usdcOrdersCollateral: this.usdcOrdersCollateral.toString(),
    };
  }

  static fromJSON(obj: LongShortRatioJSON): LongShortRatio {
    return new LongShortRatio({
      isInitialized: obj.isInitialized,
      solLong: new BN(obj.solLong),
      solShort: new BN(obj.solShort),
      btcLong: new BN(obj.btcLong),
      btcShort: new BN(obj.btcShort),
      solLong1: new BN(obj.solLong1),
      solShort1: new BN(obj.solShort1),
      bonkPrice: new BN(obj.bonkPrice),
      pythPrice: new BN(obj.pythPrice),
      jupPrice: new BN(obj.jupPrice),
      ethPrice: new BN(obj.ethPrice),
      suiPrice: new BN(obj.suiPrice),
      tiaPrice: new BN(obj.tiaPrice),
      solLong240: new BN(obj.solLong240),
      solShort240: new BN(obj.solShort240),
      btcLong1: new BN(obj.btcLong1),
      btcShort1: new BN(obj.btcShort1),
      solPrice: new BN(obj.solPrice),
      btcPrice: new BN(obj.btcPrice),
      btcLong15: new BN(obj.btcLong15),
      btcShort15: new BN(obj.btcShort15),
      btcLong60: new BN(obj.btcLong60),
      btcShort60: new BN(obj.btcShort60),
      btcLong240: new BN(obj.btcLong240),
      btcShort240: new BN(obj.btcShort240),
      totalCollateral: new BN(obj.totalCollateral),
      longCollateral: new BN(obj.longCollateral),
      shortCollateral: new BN(obj.shortCollateral),
      bonkLong: new BN(obj.bonkLong),
      bonkShort: new BN(obj.bonkShort),
      bonkLong1: new BN(obj.bonkLong1),
      bonkShort1: new BN(obj.bonkShort1),
      pythLong: new BN(obj.pythLong),
      pythShort: new BN(obj.pythShort),
      jupLong: new BN(obj.jupLong),
      jupShort: new BN(obj.jupShort),
      ethLong: new BN(obj.ethLong),
      ethShort: new BN(obj.ethShort),
      suiLong: new BN(obj.suiLong),
      suiShort: new BN(obj.suiShort),
      tiaLong: new BN(obj.tiaLong),
      tiaShort: new BN(obj.tiaShort),
      timestamp: new BN(obj.timestamp),
      usdcSolLong1: new BN(obj.usdcSolLong1),
      usdcSolShort1: new BN(obj.usdcSolShort1),
      usdcBtcLong1: new BN(obj.usdcBtcLong1),
      usdcBtcShort1: new BN(obj.usdcBtcShort1),
      usdcTotalCollateral: new BN(obj.usdcTotalCollateral),
      usdcLongCollateral: new BN(obj.usdcLongCollateral),
      usdcShortCollateral: new BN(obj.usdcShortCollateral),
      usdcSolLong: new BN(obj.usdcSolLong),
      usdcSolShort: new BN(obj.usdcSolShort),
      usdcBtcLong: new BN(obj.usdcBtcLong),
      usdcBtcShort: new BN(obj.usdcBtcShort),
      usdcBonkLong: new BN(obj.usdcBonkLong),
      usdcBonkShort: new BN(obj.usdcBonkShort),
      usdcPythLong: new BN(obj.usdcPythLong),
      usdcPythShort: new BN(obj.usdcPythShort),
      usdcJupLong: new BN(obj.usdcJupLong),
      usdcJupShort: new BN(obj.usdcJupShort),
      usdcEthLong: new BN(obj.usdcEthLong),
      usdcEthShort: new BN(obj.usdcEthShort),
      usdcSuiLong: new BN(obj.usdcSuiLong),
      usdcSuiShort: new BN(obj.usdcSuiShort),
      usdcTiaLong: new BN(obj.usdcTiaLong),
      usdcTiaShort: new BN(obj.usdcTiaShort),
      ordersCollateral: new BN(obj.ordersCollateral),
      usdcOrdersCollateral: new BN(obj.usdcOrdersCollateral),
    });
  }
}
