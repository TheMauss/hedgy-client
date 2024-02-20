import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface FuturesContractFields {
  initialPrice: BN
  finalPrice: BN
  betAmount: BN
  fees: BN
  leverage: BN
  liquidationPrice: BN
  priceDirection: number
  symbol: number
  slPrice: BN
  tpPrice: BN
  timestamp: BN
  playerAcc: PublicKey
  pnl: BN
  resolved: boolean
  order: boolean
  usdc: number
}

export interface FuturesContractJSON {
  initialPrice: string
  finalPrice: string
  betAmount: string
  fees: string
  leverage: string
  liquidationPrice: string
  priceDirection: number
  symbol: number
  slPrice: string
  tpPrice: string
  timestamp: string
  playerAcc: string
  pnl: string
  resolved: boolean
  order: boolean
  usdc: number
}

export class FuturesContract {
  readonly initialPrice: BN
  readonly finalPrice: BN
  readonly betAmount: BN
  readonly fees: BN
  readonly leverage: BN
  readonly liquidationPrice: BN
  readonly priceDirection: number
  readonly symbol: number
  readonly slPrice: BN
  readonly tpPrice: BN
  readonly timestamp: BN
  readonly playerAcc: PublicKey
  readonly pnl: BN
  readonly resolved: boolean
  readonly order: boolean
  readonly usdc: number

  static readonly discriminator = Buffer.from([
    110, 62, 231, 185, 75, 195, 129, 70,
  ])

  static readonly layout = borsh.struct([
    borsh.i64("initialPrice"),
    borsh.i64("finalPrice"),
    borsh.u64("betAmount"),
    borsh.u64("fees"),
    borsh.u64("leverage"),
    borsh.i64("liquidationPrice"),
    borsh.u8("priceDirection"),
    borsh.u8("symbol"),
    borsh.i64("slPrice"),
    borsh.i64("tpPrice"),
    borsh.u64("timestamp"),
    borsh.publicKey("playerAcc"),
    borsh.i64("pnl"),
    borsh.bool("resolved"),
    borsh.bool("order"),
    borsh.u8("usdc"),
  ])

  constructor(fields: FuturesContractFields) {
    this.initialPrice = fields.initialPrice
    this.finalPrice = fields.finalPrice
    this.betAmount = fields.betAmount
    this.fees = fields.fees
    this.leverage = fields.leverage
    this.liquidationPrice = fields.liquidationPrice
    this.priceDirection = fields.priceDirection
    this.symbol = fields.symbol
    this.slPrice = fields.slPrice
    this.tpPrice = fields.tpPrice
    this.timestamp = fields.timestamp
    this.playerAcc = fields.playerAcc
    this.pnl = fields.pnl
    this.resolved = fields.resolved
    this.order = fields.order
    this.usdc = fields.usdc
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<FuturesContract | null> {
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
  ): Promise<Array<FuturesContract | null>> {
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

  static decode(data: Buffer): FuturesContract {
    if (!data.slice(0, 8).equals(FuturesContract.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = FuturesContract.layout.decode(data.slice(8))

    return new FuturesContract({
      initialPrice: dec.initialPrice,
      finalPrice: dec.finalPrice,
      betAmount: dec.betAmount,
      fees: dec.fees,
      leverage: dec.leverage,
      liquidationPrice: dec.liquidationPrice,
      priceDirection: dec.priceDirection,
      symbol: dec.symbol,
      slPrice: dec.slPrice,
      tpPrice: dec.tpPrice,
      timestamp: dec.timestamp,
      playerAcc: dec.playerAcc,
      pnl: dec.pnl,
      resolved: dec.resolved,
      order: dec.order,
      usdc: dec.usdc,
    })
  }

  toJSON(): FuturesContractJSON {
    return {
      initialPrice: this.initialPrice.toString(),
      finalPrice: this.finalPrice.toString(),
      betAmount: this.betAmount.toString(),
      fees: this.fees.toString(),
      leverage: this.leverage.toString(),
      liquidationPrice: this.liquidationPrice.toString(),
      priceDirection: this.priceDirection,
      symbol: this.symbol,
      slPrice: this.slPrice.toString(),
      tpPrice: this.tpPrice.toString(),
      timestamp: this.timestamp.toString(),
      playerAcc: this.playerAcc.toString(),
      pnl: this.pnl.toString(),
      resolved: this.resolved,
      order: this.order,
      usdc: this.usdc,
    }
  }

  static fromJSON(obj: FuturesContractJSON): FuturesContract {
    return new FuturesContract({
      initialPrice: new BN(obj.initialPrice),
      finalPrice: new BN(obj.finalPrice),
      betAmount: new BN(obj.betAmount),
      fees: new BN(obj.fees),
      leverage: new BN(obj.leverage),
      liquidationPrice: new BN(obj.liquidationPrice),
      priceDirection: obj.priceDirection,
      symbol: obj.symbol,
      slPrice: new BN(obj.slPrice),
      tpPrice: new BN(obj.tpPrice),
      timestamp: new BN(obj.timestamp),
      playerAcc: new PublicKey(obj.playerAcc),
      pnl: new BN(obj.pnl),
      resolved: obj.resolved,
      order: obj.order,
      usdc: obj.usdc,
    })
  }
}
