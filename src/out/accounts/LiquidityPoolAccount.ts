import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface LiquidityPoolAccountFields {
  isInitialized: boolean
  poolAddress: PublicKey
  depositAddress: PublicKey
  epoch: BN
  totalDeposits: BN
  lpFees: BN
  cumulativeFeeRate: BN
  pnl: BN
  cumulativePnlRate: BN
  locked: boolean
  isHalted: boolean
}

export interface LiquidityPoolAccountJSON {
  isInitialized: boolean
  poolAddress: string
  depositAddress: string
  epoch: string
  totalDeposits: string
  lpFees: string
  cumulativeFeeRate: string
  pnl: string
  cumulativePnlRate: string
  locked: boolean
  isHalted: boolean
}

export class LiquidityPoolAccount {
  readonly isInitialized: boolean
  readonly poolAddress: PublicKey
  readonly depositAddress: PublicKey
  readonly epoch: BN
  readonly totalDeposits: BN
  readonly lpFees: BN
  readonly cumulativeFeeRate: BN
  readonly pnl: BN
  readonly cumulativePnlRate: BN
  readonly locked: boolean
  readonly isHalted: boolean

  static readonly discriminator = Buffer.from([
    206, 167, 102, 42, 191, 239, 193, 164,
  ])

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.publicKey("poolAddress"),
    borsh.publicKey("depositAddress"),
    borsh.u64("epoch"),
    borsh.u64("totalDeposits"),
    borsh.u64("lpFees"),
    borsh.u64("cumulativeFeeRate"),
    borsh.i64("pnl"),
    borsh.i64("cumulativePnlRate"),
    borsh.bool("locked"),
    borsh.bool("isHalted"),
  ])

  constructor(fields: LiquidityPoolAccountFields) {
    this.isInitialized = fields.isInitialized
    this.poolAddress = fields.poolAddress
    this.depositAddress = fields.depositAddress
    this.epoch = fields.epoch
    this.totalDeposits = fields.totalDeposits
    this.lpFees = fields.lpFees
    this.cumulativeFeeRate = fields.cumulativeFeeRate
    this.pnl = fields.pnl
    this.cumulativePnlRate = fields.cumulativePnlRate
    this.locked = fields.locked
    this.isHalted = fields.isHalted
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<LiquidityPoolAccount | null> {
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
  ): Promise<Array<LiquidityPoolAccount | null>> {
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

  static decode(data: Buffer): LiquidityPoolAccount {
    if (!data.slice(0, 8).equals(LiquidityPoolAccount.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = LiquidityPoolAccount.layout.decode(data.slice(8))

    return new LiquidityPoolAccount({
      isInitialized: dec.isInitialized,
      poolAddress: dec.poolAddress,
      depositAddress: dec.depositAddress,
      epoch: dec.epoch,
      totalDeposits: dec.totalDeposits,
      lpFees: dec.lpFees,
      cumulativeFeeRate: dec.cumulativeFeeRate,
      pnl: dec.pnl,
      cumulativePnlRate: dec.cumulativePnlRate,
      locked: dec.locked,
      isHalted: dec.isHalted,
    })
  }

  toJSON(): LiquidityPoolAccountJSON {
    return {
      isInitialized: this.isInitialized,
      poolAddress: this.poolAddress.toString(),
      depositAddress: this.depositAddress.toString(),
      epoch: this.epoch.toString(),
      totalDeposits: this.totalDeposits.toString(),
      lpFees: this.lpFees.toString(),
      cumulativeFeeRate: this.cumulativeFeeRate.toString(),
      pnl: this.pnl.toString(),
      cumulativePnlRate: this.cumulativePnlRate.toString(),
      locked: this.locked,
      isHalted: this.isHalted,
    }
  }

  static fromJSON(obj: LiquidityPoolAccountJSON): LiquidityPoolAccount {
    return new LiquidityPoolAccount({
      isInitialized: obj.isInitialized,
      poolAddress: new PublicKey(obj.poolAddress),
      depositAddress: new PublicKey(obj.depositAddress),
      epoch: new BN(obj.epoch),
      totalDeposits: new BN(obj.totalDeposits),
      lpFees: new BN(obj.lpFees),
      cumulativeFeeRate: new BN(obj.cumulativeFeeRate),
      pnl: new BN(obj.pnl),
      cumulativePnlRate: new BN(obj.cumulativePnlRate),
      locked: obj.locked,
      isHalted: obj.isHalted,
    })
  }
}
