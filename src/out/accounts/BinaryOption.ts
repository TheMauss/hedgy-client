import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface BinaryOptionFields {
  initialPrice: BN
  finalPrice: BN
  betAmount: BN
  expiration: BN
  priceDirection: number
  symbol: number
  expirationTime: BN
  playerAcc: PublicKey
  resolved: boolean
  payout: BN
}

export interface BinaryOptionJSON {
  initialPrice: string
  finalPrice: string
  betAmount: string
  expiration: string
  priceDirection: number
  symbol: number
  expirationTime: string
  playerAcc: string
  resolved: boolean
  payout: string
}

export class BinaryOption {
  readonly initialPrice: BN
  readonly finalPrice: BN
  readonly betAmount: BN
  readonly expiration: BN
  readonly priceDirection: number
  readonly symbol: number
  readonly expirationTime: BN
  readonly playerAcc: PublicKey
  readonly resolved: boolean
  readonly payout: BN

  static readonly discriminator = Buffer.from([115, 1, 78, 208, 48, 220, 57, 9])

  static readonly layout = borsh.struct([
    borsh.i64("initialPrice"),
    borsh.i64("finalPrice"),
    borsh.u64("betAmount"),
    borsh.u64("expiration"),
    borsh.u8("priceDirection"),
    borsh.u8("symbol"),
    borsh.u64("expirationTime"),
    borsh.publicKey("playerAcc"),
    borsh.bool("resolved"),
    borsh.u64("payout"),
  ])

  constructor(fields: BinaryOptionFields) {
    this.initialPrice = fields.initialPrice
    this.finalPrice = fields.finalPrice
    this.betAmount = fields.betAmount
    this.expiration = fields.expiration
    this.priceDirection = fields.priceDirection
    this.symbol = fields.symbol
    this.expirationTime = fields.expirationTime
    this.playerAcc = fields.playerAcc
    this.resolved = fields.resolved
    this.payout = fields.payout
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<BinaryOption | null> {
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
  ): Promise<Array<BinaryOption | null>> {
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

  static decode(data: Buffer): BinaryOption {
    if (!data.slice(0, 8).equals(BinaryOption.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = BinaryOption.layout.decode(data.slice(8))

    return new BinaryOption({
      initialPrice: dec.initialPrice,
      finalPrice: dec.finalPrice,
      betAmount: dec.betAmount,
      expiration: dec.expiration,
      priceDirection: dec.priceDirection,
      symbol: dec.symbol,
      expirationTime: dec.expirationTime,
      playerAcc: dec.playerAcc,
      resolved: dec.resolved,
      payout: dec.payout,
    })
  }

  toJSON(): BinaryOptionJSON {
    return {
      initialPrice: this.initialPrice.toString(),
      finalPrice: this.finalPrice.toString(),
      betAmount: this.betAmount.toString(),
      expiration: this.expiration.toString(),
      priceDirection: this.priceDirection,
      symbol: this.symbol,
      expirationTime: this.expirationTime.toString(),
      playerAcc: this.playerAcc.toString(),
      resolved: this.resolved,
      payout: this.payout.toString(),
    }
  }

  static fromJSON(obj: BinaryOptionJSON): BinaryOption {
    return new BinaryOption({
      initialPrice: new BN(obj.initialPrice),
      finalPrice: new BN(obj.finalPrice),
      betAmount: new BN(obj.betAmount),
      expiration: new BN(obj.expiration),
      priceDirection: obj.priceDirection,
      symbol: obj.symbol,
      expirationTime: new BN(obj.expirationTime),
      playerAcc: new PublicKey(obj.playerAcc),
      resolved: obj.resolved,
      payout: new BN(obj.payout),
    })
  }
}
