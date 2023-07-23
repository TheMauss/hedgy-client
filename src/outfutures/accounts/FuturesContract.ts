import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface FuturesContractFields {
  initialPrice: BN
  finalPrice: BN
  betAmount: BN
  leverage: BN
  liquidationPrice: BN
  priceDirection: number
  symbol: number
  stopLossPrice: BN
  takeProfitPrice: BN
  winner: PublicKey | null
  playerAcc: PublicKey
  resolved: boolean
}

export interface FuturesContractJSON {
  initialPrice: string
  finalPrice: string
  betAmount: string
  leverage: string
  liquidationPrice: string
  priceDirection: number
  symbol: number
  stopLossPrice: string
  takeProfitPrice: string
  winner: string | null
  playerAcc: string
  resolved: boolean
}

export class FuturesContract {
  readonly initialPrice: BN
  readonly finalPrice: BN
  readonly betAmount: BN
  readonly leverage: BN
  readonly liquidationPrice: BN
  readonly priceDirection: number
  readonly symbol: number
  readonly stopLossPrice: BN
  readonly takeProfitPrice: BN
  readonly winner: PublicKey | null
  readonly playerAcc: PublicKey
  readonly resolved: boolean

  static readonly discriminator = Buffer.from([
    110, 62, 231, 185, 75, 195, 129, 70,
  ])

  static readonly layout = borsh.struct([
    borsh.i64("initialPrice"),
    borsh.i64("finalPrice"),
    borsh.u64("betAmount"),
    borsh.u64("leverage"),
    borsh.i64("liquidationPrice"),
    borsh.u8("priceDirection"),
    borsh.u8("symbol"),
    borsh.i64("stopLossPrice"),
    borsh.i64("takeProfitPrice"),
    borsh.option(borsh.publicKey(), "winner"),
    borsh.publicKey("playerAcc"),
    borsh.bool("resolved"),
  ])

  constructor(fields: FuturesContractFields) {
    this.initialPrice = fields.initialPrice
    this.finalPrice = fields.finalPrice
    this.betAmount = fields.betAmount
    this.leverage = fields.leverage
    this.liquidationPrice = fields.liquidationPrice
    this.priceDirection = fields.priceDirection
    this.symbol = fields.symbol
    this.stopLossPrice = fields.stopLossPrice
    this.takeProfitPrice = fields.takeProfitPrice
    this.winner = fields.winner
    this.playerAcc = fields.playerAcc
    this.resolved = fields.resolved
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
      leverage: dec.leverage,
      liquidationPrice: dec.liquidationPrice,
      priceDirection: dec.priceDirection,
      symbol: dec.symbol,
      stopLossPrice: dec.stopLossPrice,
      takeProfitPrice: dec.takeProfitPrice,
      winner: dec.winner,
      playerAcc: dec.playerAcc,
      resolved: dec.resolved,
    })
  }

  toJSON(): FuturesContractJSON {
    return {
      initialPrice: this.initialPrice.toString(),
      finalPrice: this.finalPrice.toString(),
      betAmount: this.betAmount.toString(),
      leverage: this.leverage.toString(),
      liquidationPrice: this.liquidationPrice.toString(),
      priceDirection: this.priceDirection,
      symbol: this.symbol,
      stopLossPrice: this.stopLossPrice.toString(),
      takeProfitPrice: this.takeProfitPrice.toString(),
      winner: (this.winner && this.winner.toString()) || null,
      playerAcc: this.playerAcc.toString(),
      resolved: this.resolved,
    }
  }

  static fromJSON(obj: FuturesContractJSON): FuturesContract {
    return new FuturesContract({
      initialPrice: new BN(obj.initialPrice),
      finalPrice: new BN(obj.finalPrice),
      betAmount: new BN(obj.betAmount),
      leverage: new BN(obj.leverage),
      liquidationPrice: new BN(obj.liquidationPrice),
      priceDirection: obj.priceDirection,
      symbol: obj.symbol,
      stopLossPrice: new BN(obj.stopLossPrice),
      takeProfitPrice: new BN(obj.takeProfitPrice),
      winner: (obj.winner && new PublicKey(obj.winner)) || null,
      playerAcc: new PublicKey(obj.playerAcc),
      resolved: obj.resolved,
    })
  }
}
