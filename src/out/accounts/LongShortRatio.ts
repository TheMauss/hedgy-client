import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface LongShortRatioFields {
  isInitialized: boolean;
  totalCollateral: BN;
  longCollateral: BN;
  shortCollateral: BN;
  usdcTotalCollateral: BN;
  usdcLongCollateral: BN;
  usdcShortCollateral: BN;
  solLong: BN;
  solShort: BN;
  btcLong: BN;
  btcShort: BN;
  bonkLong: BN;
  bonkShort: BN;
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
  totalCollateral: string;
  longCollateral: string;
  shortCollateral: string;
  usdcTotalCollateral: string;
  usdcLongCollateral: string;
  usdcShortCollateral: string;
  solLong: string;
  solShort: string;
  btcLong: string;
  btcShort: string;
  bonkLong: string;
  bonkShort: string;
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
  readonly totalCollateral: BN;
  readonly longCollateral: BN;
  readonly shortCollateral: BN;
  readonly usdcTotalCollateral: BN;
  readonly usdcLongCollateral: BN;
  readonly usdcShortCollateral: BN;
  readonly solLong: BN;
  readonly solShort: BN;
  readonly btcLong: BN;
  readonly btcShort: BN;
  readonly bonkLong: BN;
  readonly bonkShort: BN;
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
    borsh.u64("totalCollateral"),
    borsh.u64("longCollateral"),
    borsh.u64("shortCollateral"),
    borsh.u64("usdcTotalCollateral"),
    borsh.u64("usdcLongCollateral"),
    borsh.u64("usdcShortCollateral"),
    borsh.u64("solLong"),
    borsh.u64("solShort"),
    borsh.u64("btcLong"),
    borsh.u64("btcShort"),
    borsh.u64("bonkLong"),
    borsh.u64("bonkShort"),
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
    this.totalCollateral = fields.totalCollateral;
    this.longCollateral = fields.longCollateral;
    this.shortCollateral = fields.shortCollateral;
    this.usdcTotalCollateral = fields.usdcTotalCollateral;
    this.usdcLongCollateral = fields.usdcLongCollateral;
    this.usdcShortCollateral = fields.usdcShortCollateral;
    this.solLong = fields.solLong;
    this.solShort = fields.solShort;
    this.btcLong = fields.btcLong;
    this.btcShort = fields.btcShort;
    this.bonkLong = fields.bonkLong;
    this.bonkShort = fields.bonkShort;
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
      totalCollateral: dec.totalCollateral,
      longCollateral: dec.longCollateral,
      shortCollateral: dec.shortCollateral,
      usdcTotalCollateral: dec.usdcTotalCollateral,
      usdcLongCollateral: dec.usdcLongCollateral,
      usdcShortCollateral: dec.usdcShortCollateral,
      solLong: dec.solLong,
      solShort: dec.solShort,
      btcLong: dec.btcLong,
      btcShort: dec.btcShort,
      bonkLong: dec.bonkLong,
      bonkShort: dec.bonkShort,
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
      totalCollateral: this.totalCollateral.toString(),
      longCollateral: this.longCollateral.toString(),
      shortCollateral: this.shortCollateral.toString(),
      usdcTotalCollateral: this.usdcTotalCollateral.toString(),
      usdcLongCollateral: this.usdcLongCollateral.toString(),
      usdcShortCollateral: this.usdcShortCollateral.toString(),
      solLong: this.solLong.toString(),
      solShort: this.solShort.toString(),
      btcLong: this.btcLong.toString(),
      btcShort: this.btcShort.toString(),
      bonkLong: this.bonkLong.toString(),
      bonkShort: this.bonkShort.toString(),
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
      totalCollateral: new BN(obj.totalCollateral),
      longCollateral: new BN(obj.longCollateral),
      shortCollateral: new BN(obj.shortCollateral),
      usdcTotalCollateral: new BN(obj.usdcTotalCollateral),
      usdcLongCollateral: new BN(obj.usdcLongCollateral),
      usdcShortCollateral: new BN(obj.usdcShortCollateral),
      solLong: new BN(obj.solLong),
      solShort: new BN(obj.solShort),
      btcLong: new BN(obj.btcLong),
      btcShort: new BN(obj.btcShort),
      bonkLong: new BN(obj.bonkLong),
      bonkShort: new BN(obj.bonkShort),
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
