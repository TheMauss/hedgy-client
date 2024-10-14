import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ReferrerNameFields {
  authority: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
  name: Array<number>;
}

export interface ReferrerNameJSON {
  authority: string;
  user: string;
  userStats: string;
  name: Array<number>;
}

export class ReferrerName {
  readonly authority: PublicKey;
  readonly user: PublicKey;
  readonly userStats: PublicKey;
  readonly name: Array<number>;

  static readonly discriminator = Buffer.from([
    105, 133, 170, 110, 52, 42, 28, 182,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("authority"),
    borsh.publicKey("user"),
    borsh.publicKey("userStats"),
    borsh.array(borsh.u8(), 32, "name"),
  ]);

  constructor(fields: ReferrerNameFields) {
    this.authority = fields.authority;
    this.user = fields.user;
    this.userStats = fields.userStats;
    this.name = fields.name;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<ReferrerName | null> {
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
  ): Promise<Array<ReferrerName | null>> {
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

  static decode(data: Buffer): ReferrerName {
    if (!data.slice(0, 8).equals(ReferrerName.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = ReferrerName.layout.decode(data.slice(8));

    return new ReferrerName({
      authority: dec.authority,
      user: dec.user,
      userStats: dec.userStats,
      name: dec.name,
    });
  }

  toJSON(): ReferrerNameJSON {
    return {
      authority: this.authority.toString(),
      user: this.user.toString(),
      userStats: this.userStats.toString(),
      name: this.name,
    };
  }

  static fromJSON(obj: ReferrerNameJSON): ReferrerName {
    return new ReferrerName({
      authority: new PublicKey(obj.authority),
      user: new PublicKey(obj.user),
      userStats: new PublicKey(obj.userStats),
      name: obj.name,
    });
  }
}
