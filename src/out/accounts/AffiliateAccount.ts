import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface AffiliateAccountFields {
  isInitialized: boolean
  affiliateWallet: PublicKey
  affiliateCode: Array<number>
  totalAffiliatesUsers: BN
  totalAffiliatesVolume: BN
  totalEarned: BN
  ambassador: boolean
  usdcTotalAffiliatesVolume: BN
  usdcTotalEarned: BN
}

export interface AffiliateAccountJSON {
  isInitialized: boolean
  affiliateWallet: string
  affiliateCode: Array<number>
  totalAffiliatesUsers: string
  totalAffiliatesVolume: string
  totalEarned: string
  ambassador: boolean
  usdcTotalAffiliatesVolume: string
  usdcTotalEarned: string
}

export class AffiliateAccount {
  readonly isInitialized: boolean
  readonly affiliateWallet: PublicKey
  readonly affiliateCode: Array<number>
  readonly totalAffiliatesUsers: BN
  readonly totalAffiliatesVolume: BN
  readonly totalEarned: BN
  readonly ambassador: boolean
  readonly usdcTotalAffiliatesVolume: BN
  readonly usdcTotalEarned: BN

  static readonly discriminator = Buffer.from([
    189, 94, 244, 154, 243, 52, 127, 157,
  ])

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.publicKey("affiliateWallet"),
    borsh.array(borsh.u8(), 8, "affiliateCode"),
    borsh.u64("totalAffiliatesUsers"),
    borsh.u64("totalAffiliatesVolume"),
    borsh.u64("totalEarned"),
    borsh.bool("ambassador"),
    borsh.u64("usdcTotalAffiliatesVolume"),
    borsh.u64("usdcTotalEarned"),
  ])

  constructor(fields: AffiliateAccountFields) {
    this.isInitialized = fields.isInitialized
    this.affiliateWallet = fields.affiliateWallet
    this.affiliateCode = fields.affiliateCode
    this.totalAffiliatesUsers = fields.totalAffiliatesUsers
    this.totalAffiliatesVolume = fields.totalAffiliatesVolume
    this.totalEarned = fields.totalEarned
    this.ambassador = fields.ambassador
    this.usdcTotalAffiliatesVolume = fields.usdcTotalAffiliatesVolume
    this.usdcTotalEarned = fields.usdcTotalEarned
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<AffiliateAccount | null> {
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
  ): Promise<Array<AffiliateAccount | null>> {
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

  static decode(data: Buffer): AffiliateAccount {
    if (!data.slice(0, 8).equals(AffiliateAccount.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = AffiliateAccount.layout.decode(data.slice(8))

    return new AffiliateAccount({
      isInitialized: dec.isInitialized,
      affiliateWallet: dec.affiliateWallet,
      affiliateCode: dec.affiliateCode,
      totalAffiliatesUsers: dec.totalAffiliatesUsers,
      totalAffiliatesVolume: dec.totalAffiliatesVolume,
      totalEarned: dec.totalEarned,
      ambassador: dec.ambassador,
      usdcTotalAffiliatesVolume: dec.usdcTotalAffiliatesVolume,
      usdcTotalEarned: dec.usdcTotalEarned,
    })
  }

  toJSON(): AffiliateAccountJSON {
    return {
      isInitialized: this.isInitialized,
      affiliateWallet: this.affiliateWallet.toString(),
      affiliateCode: this.affiliateCode,
      totalAffiliatesUsers: this.totalAffiliatesUsers.toString(),
      totalAffiliatesVolume: this.totalAffiliatesVolume.toString(),
      totalEarned: this.totalEarned.toString(),
      ambassador: this.ambassador,
      usdcTotalAffiliatesVolume: this.usdcTotalAffiliatesVolume.toString(),
      usdcTotalEarned: this.usdcTotalEarned.toString(),
    }
  }

  static fromJSON(obj: AffiliateAccountJSON): AffiliateAccount {
    return new AffiliateAccount({
      isInitialized: obj.isInitialized,
      affiliateWallet: new PublicKey(obj.affiliateWallet),
      affiliateCode: obj.affiliateCode,
      totalAffiliatesUsers: new BN(obj.totalAffiliatesUsers),
      totalAffiliatesVolume: new BN(obj.totalAffiliatesVolume),
      totalEarned: new BN(obj.totalEarned),
      ambassador: obj.ambassador,
      usdcTotalAffiliatesVolume: new BN(obj.usdcTotalAffiliatesVolume),
      usdcTotalEarned: new BN(obj.usdcTotalEarned),
    })
  }
}
