import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UserAccountFields {
  isInitialized: boolean
  creationTime: BN
  myWallet: PublicKey
  myAffiliate: Array<number>
  usedAffiliate: Array<number>
  userBetAmountBtc: BN
  userBetAmountSol: BN
  userBinaryBetAmountBtc: BN
  userBinaryBetAmountSol: BN
}

export interface UserAccountJSON {
  isInitialized: boolean
  creationTime: string
  myWallet: string
  myAffiliate: Array<number>
  usedAffiliate: Array<number>
  userBetAmountBtc: string
  userBetAmountSol: string
  userBinaryBetAmountBtc: string
  userBinaryBetAmountSol: string
}

export class UserAccount {
  readonly isInitialized: boolean
  readonly creationTime: BN
  readonly myWallet: PublicKey
  readonly myAffiliate: Array<number>
  readonly usedAffiliate: Array<number>
  readonly userBetAmountBtc: BN
  readonly userBetAmountSol: BN
  readonly userBinaryBetAmountBtc: BN
  readonly userBinaryBetAmountSol: BN

  static readonly discriminator = Buffer.from([
    211, 33, 136, 16, 186, 110, 242, 127,
  ])

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
  ])

  constructor(fields: UserAccountFields) {
    this.isInitialized = fields.isInitialized
    this.creationTime = fields.creationTime
    this.myWallet = fields.myWallet
    this.myAffiliate = fields.myAffiliate
    this.usedAffiliate = fields.usedAffiliate
    this.userBetAmountBtc = fields.userBetAmountBtc
    this.userBetAmountSol = fields.userBetAmountSol
    this.userBinaryBetAmountBtc = fields.userBinaryBetAmountBtc
    this.userBinaryBetAmountSol = fields.userBinaryBetAmountSol
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<UserAccount | null> {
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
  ): Promise<Array<UserAccount | null>> {
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

  static decode(data: Buffer): UserAccount {
    if (!data.slice(0, 8).equals(UserAccount.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = UserAccount.layout.decode(data.slice(8))

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
    })
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
    }
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
    })
  }
}
