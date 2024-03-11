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
  totalRebates: BN
  usdcTotalDeposits: BN
  usdcLpFees: BN
  usdcCumulativeFeeRate: BN
  usdcPnl: BN
  usdcCumulativePnlRate: BN
  psolValuation: BN
  pusdcValuation: BN
  pusdcMinted: BN
  psolMinted: BN
  solHouseFees: BN
  usdcHouseFees: BN
  projectsDepositedSol: BN
  projectsDepositedUsdc: BN
  psolTotalStaked: BN
  pusdcTotalStaked: BN
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
  totalRebates: string
  usdcTotalDeposits: string
  usdcLpFees: string
  usdcCumulativeFeeRate: string
  usdcPnl: string
  usdcCumulativePnlRate: string
  psolValuation: string
  pusdcValuation: string
  pusdcMinted: string
  psolMinted: string
  solHouseFees: string
  usdcHouseFees: string
  projectsDepositedSol: string
  projectsDepositedUsdc: string
  psolTotalStaked: string
  pusdcTotalStaked: string
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
  readonly totalRebates: BN
  readonly usdcTotalDeposits: BN
  readonly usdcLpFees: BN
  readonly usdcCumulativeFeeRate: BN
  readonly usdcPnl: BN
  readonly usdcCumulativePnlRate: BN
  readonly psolValuation: BN
  readonly pusdcValuation: BN
  readonly pusdcMinted: BN
  readonly psolMinted: BN
  readonly solHouseFees: BN
  readonly usdcHouseFees: BN
  readonly projectsDepositedSol: BN
  readonly projectsDepositedUsdc: BN
  readonly psolTotalStaked: BN
  readonly pusdcTotalStaked: BN

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
    borsh.u64("totalRebates"),
    borsh.u64("usdcTotalDeposits"),
    borsh.u64("usdcLpFees"),
    borsh.u64("usdcCumulativeFeeRate"),
    borsh.i64("usdcPnl"),
    borsh.i64("usdcCumulativePnlRate"),
    borsh.u64("psolValuation"),
    borsh.u64("pusdcValuation"),
    borsh.u64("pusdcMinted"),
    borsh.u64("psolMinted"),
    borsh.u64("solHouseFees"),
    borsh.u64("usdcHouseFees"),
    borsh.u64("projectsDepositedSol"),
    borsh.u64("projectsDepositedUsdc"),
    borsh.u64("psolTotalStaked"),
    borsh.u64("pusdcTotalStaked"),
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
    this.totalRebates = fields.totalRebates
    this.usdcTotalDeposits = fields.usdcTotalDeposits
    this.usdcLpFees = fields.usdcLpFees
    this.usdcCumulativeFeeRate = fields.usdcCumulativeFeeRate
    this.usdcPnl = fields.usdcPnl
    this.usdcCumulativePnlRate = fields.usdcCumulativePnlRate
    this.psolValuation = fields.psolValuation
    this.pusdcValuation = fields.pusdcValuation
    this.pusdcMinted = fields.pusdcMinted
    this.psolMinted = fields.psolMinted
    this.solHouseFees = fields.solHouseFees
    this.usdcHouseFees = fields.usdcHouseFees
    this.projectsDepositedSol = fields.projectsDepositedSol
    this.projectsDepositedUsdc = fields.projectsDepositedUsdc
    this.psolTotalStaked = fields.psolTotalStaked
    this.pusdcTotalStaked = fields.pusdcTotalStaked
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
      totalRebates: dec.totalRebates,
      usdcTotalDeposits: dec.usdcTotalDeposits,
      usdcLpFees: dec.usdcLpFees,
      usdcCumulativeFeeRate: dec.usdcCumulativeFeeRate,
      usdcPnl: dec.usdcPnl,
      usdcCumulativePnlRate: dec.usdcCumulativePnlRate,
      psolValuation: dec.psolValuation,
      pusdcValuation: dec.pusdcValuation,
      pusdcMinted: dec.pusdcMinted,
      psolMinted: dec.psolMinted,
      solHouseFees: dec.solHouseFees,
      usdcHouseFees: dec.usdcHouseFees,
      projectsDepositedSol: dec.projectsDepositedSol,
      projectsDepositedUsdc: dec.projectsDepositedUsdc,
      psolTotalStaked: dec.psolTotalStaked,
      pusdcTotalStaked: dec.pusdcTotalStaked,
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
      totalRebates: this.totalRebates.toString(),
      usdcTotalDeposits: this.usdcTotalDeposits.toString(),
      usdcLpFees: this.usdcLpFees.toString(),
      usdcCumulativeFeeRate: this.usdcCumulativeFeeRate.toString(),
      usdcPnl: this.usdcPnl.toString(),
      usdcCumulativePnlRate: this.usdcCumulativePnlRate.toString(),
      psolValuation: this.psolValuation.toString(),
      pusdcValuation: this.pusdcValuation.toString(),
      pusdcMinted: this.pusdcMinted.toString(),
      psolMinted: this.psolMinted.toString(),
      solHouseFees: this.solHouseFees.toString(),
      usdcHouseFees: this.usdcHouseFees.toString(),
      projectsDepositedSol: this.projectsDepositedSol.toString(),
      projectsDepositedUsdc: this.projectsDepositedUsdc.toString(),
      psolTotalStaked: this.psolTotalStaked.toString(),
      pusdcTotalStaked: this.pusdcTotalStaked.toString(),
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
      totalRebates: new BN(obj.totalRebates),
      usdcTotalDeposits: new BN(obj.usdcTotalDeposits),
      usdcLpFees: new BN(obj.usdcLpFees),
      usdcCumulativeFeeRate: new BN(obj.usdcCumulativeFeeRate),
      usdcPnl: new BN(obj.usdcPnl),
      usdcCumulativePnlRate: new BN(obj.usdcCumulativePnlRate),
      psolValuation: new BN(obj.psolValuation),
      pusdcValuation: new BN(obj.pusdcValuation),
      pusdcMinted: new BN(obj.pusdcMinted),
      psolMinted: new BN(obj.psolMinted),
      solHouseFees: new BN(obj.solHouseFees),
      usdcHouseFees: new BN(obj.usdcHouseFees),
      projectsDepositedSol: new BN(obj.projectsDepositedSol),
      projectsDepositedUsdc: new BN(obj.projectsDepositedUsdc),
      psolTotalStaked: new BN(obj.psolTotalStaked),
      pusdcTotalStaked: new BN(obj.pusdcTotalStaked),
    })
  }
}
