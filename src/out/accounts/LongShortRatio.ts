import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface LongShortRatioFields {
  isInitialized: boolean
  solLong: BN
  solShort: BN
  btcLong: BN
  btcShort: BN
  solLong1: BN
  solShort1: BN
  solLong5: BN
  solShort5: BN
  solLong15: BN
  solShort15: BN
  solLong60: BN
  solShort60: BN
  solLong240: BN
  solShort240: BN
  btcLong1: BN
  btcShort1: BN
  btcLong5: BN
  btcShort5: BN
  btcLong15: BN
  btcShort15: BN
  btcLong60: BN
  btcShort60: BN
  btcLong240: BN
  btcShort240: BN
  totalCollateral: BN
  longCollateral: BN
  shortCollateral: BN
  bonkLong: BN
  bonkShort: BN
  bonkLong1: BN
  bonkShort1: BN
  pythLong: BN
  pythShort: BN
  jupLong: BN
  jupShort: BN
  ethLong: BN
  ethShort: BN
  suiLong: BN
  suiShort: BN
  tiaLong: BN
  tiaShort: BN
}

export interface LongShortRatioJSON {
  isInitialized: boolean
  solLong: string
  solShort: string
  btcLong: string
  btcShort: string
  solLong1: string
  solShort1: string
  solLong5: string
  solShort5: string
  solLong15: string
  solShort15: string
  solLong60: string
  solShort60: string
  solLong240: string
  solShort240: string
  btcLong1: string
  btcShort1: string
  btcLong5: string
  btcShort5: string
  btcLong15: string
  btcShort15: string
  btcLong60: string
  btcShort60: string
  btcLong240: string
  btcShort240: string
  totalCollateral: string
  longCollateral: string
  shortCollateral: string
  bonkLong: string
  bonkShort: string
  bonkLong1: string
  bonkShort1: string
  pythLong: string
  pythShort: string
  jupLong: string
  jupShort: string
  ethLong: string
  ethShort: string
  suiLong: string
  suiShort: string
  tiaLong: string
  tiaShort: string
}

export class LongShortRatio {
  readonly isInitialized: boolean
  readonly solLong: BN
  readonly solShort: BN
  readonly btcLong: BN
  readonly btcShort: BN
  readonly solLong1: BN
  readonly solShort1: BN
  readonly solLong5: BN
  readonly solShort5: BN
  readonly solLong15: BN
  readonly solShort15: BN
  readonly solLong60: BN
  readonly solShort60: BN
  readonly solLong240: BN
  readonly solShort240: BN
  readonly btcLong1: BN
  readonly btcShort1: BN
  readonly btcLong5: BN
  readonly btcShort5: BN
  readonly btcLong15: BN
  readonly btcShort15: BN
  readonly btcLong60: BN
  readonly btcShort60: BN
  readonly btcLong240: BN
  readonly btcShort240: BN
  readonly totalCollateral: BN
  readonly longCollateral: BN
  readonly shortCollateral: BN
  readonly bonkLong: BN
  readonly bonkShort: BN
  readonly bonkLong1: BN
  readonly bonkShort1: BN
  readonly pythLong: BN
  readonly pythShort: BN
  readonly jupLong: BN
  readonly jupShort: BN
  readonly ethLong: BN
  readonly ethShort: BN
  readonly suiLong: BN
  readonly suiShort: BN
  readonly tiaLong: BN
  readonly tiaShort: BN

  static readonly discriminator = Buffer.from([
    18, 172, 89, 131, 240, 106, 141, 203,
  ])

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.u64("solLong"),
    borsh.u64("solShort"),
    borsh.u64("btcLong"),
    borsh.u64("btcShort"),
    borsh.u64("solLong1"),
    borsh.u64("solShort1"),
    borsh.u64("solLong5"),
    borsh.u64("solShort5"),
    borsh.u64("solLong15"),
    borsh.u64("solShort15"),
    borsh.u64("solLong60"),
    borsh.u64("solShort60"),
    borsh.u64("solLong240"),
    borsh.u64("solShort240"),
    borsh.u64("btcLong1"),
    borsh.u64("btcShort1"),
    borsh.u64("btcLong5"),
    borsh.u64("btcShort5"),
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
  ])

  constructor(fields: LongShortRatioFields) {
    this.isInitialized = fields.isInitialized
    this.solLong = fields.solLong
    this.solShort = fields.solShort
    this.btcLong = fields.btcLong
    this.btcShort = fields.btcShort
    this.solLong1 = fields.solLong1
    this.solShort1 = fields.solShort1
    this.solLong5 = fields.solLong5
    this.solShort5 = fields.solShort5
    this.solLong15 = fields.solLong15
    this.solShort15 = fields.solShort15
    this.solLong60 = fields.solLong60
    this.solShort60 = fields.solShort60
    this.solLong240 = fields.solLong240
    this.solShort240 = fields.solShort240
    this.btcLong1 = fields.btcLong1
    this.btcShort1 = fields.btcShort1
    this.btcLong5 = fields.btcLong5
    this.btcShort5 = fields.btcShort5
    this.btcLong15 = fields.btcLong15
    this.btcShort15 = fields.btcShort15
    this.btcLong60 = fields.btcLong60
    this.btcShort60 = fields.btcShort60
    this.btcLong240 = fields.btcLong240
    this.btcShort240 = fields.btcShort240
    this.totalCollateral = fields.totalCollateral
    this.longCollateral = fields.longCollateral
    this.shortCollateral = fields.shortCollateral
    this.bonkLong = fields.bonkLong
    this.bonkShort = fields.bonkShort
    this.bonkLong1 = fields.bonkLong1
    this.bonkShort1 = fields.bonkShort1
    this.pythLong = fields.pythLong
    this.pythShort = fields.pythShort
    this.jupLong = fields.jupLong
    this.jupShort = fields.jupShort
    this.ethLong = fields.ethLong
    this.ethShort = fields.ethShort
    this.suiLong = fields.suiLong
    this.suiShort = fields.suiShort
    this.tiaLong = fields.tiaLong
    this.tiaShort = fields.tiaShort
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<LongShortRatio | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }
    if (!info.owner.equals(programId)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[],
    programId: PublicKey = PROGRAM_ID
  ): Promise<Array<LongShortRatio | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(programId)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): LongShortRatio {
    if (!data.slice(0, 8).equals(LongShortRatio.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = LongShortRatio.layout.decode(data.slice(8))

    return new LongShortRatio({
      isInitialized: dec.isInitialized,
      solLong: dec.solLong,
      solShort: dec.solShort,
      btcLong: dec.btcLong,
      btcShort: dec.btcShort,
      solLong1: dec.solLong1,
      solShort1: dec.solShort1,
      solLong5: dec.solLong5,
      solShort5: dec.solShort5,
      solLong15: dec.solLong15,
      solShort15: dec.solShort15,
      solLong60: dec.solLong60,
      solShort60: dec.solShort60,
      solLong240: dec.solLong240,
      solShort240: dec.solShort240,
      btcLong1: dec.btcLong1,
      btcShort1: dec.btcShort1,
      btcLong5: dec.btcLong5,
      btcShort5: dec.btcShort5,
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
    })
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
      solLong5: this.solLong5.toString(),
      solShort5: this.solShort5.toString(),
      solLong15: this.solLong15.toString(),
      solShort15: this.solShort15.toString(),
      solLong60: this.solLong60.toString(),
      solShort60: this.solShort60.toString(),
      solLong240: this.solLong240.toString(),
      solShort240: this.solShort240.toString(),
      btcLong1: this.btcLong1.toString(),
      btcShort1: this.btcShort1.toString(),
      btcLong5: this.btcLong5.toString(),
      btcShort5: this.btcShort5.toString(),
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
    }
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
      solLong5: new BN(obj.solLong5),
      solShort5: new BN(obj.solShort5),
      solLong15: new BN(obj.solLong15),
      solShort15: new BN(obj.solShort15),
      solLong60: new BN(obj.solLong60),
      solShort60: new BN(obj.solShort60),
      solLong240: new BN(obj.solLong240),
      solShort240: new BN(obj.solShort240),
      btcLong1: new BN(obj.btcLong1),
      btcShort1: new BN(obj.btcShort1),
      btcLong5: new BN(obj.btcLong5),
      btcShort5: new BN(obj.btcShort5),
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
    })
  }
}
