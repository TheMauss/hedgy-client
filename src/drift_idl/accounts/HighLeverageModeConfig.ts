import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface HighLeverageModeConfigFields {
  maxUsers: number;
  currentUsers: number;
  reduceOnly: number;
  padding: Array<number>;
}

export interface HighLeverageModeConfigJSON {
  maxUsers: number;
  currentUsers: number;
  reduceOnly: number;
  padding: Array<number>;
}

export class HighLeverageModeConfig {
  readonly maxUsers: number;
  readonly currentUsers: number;
  readonly reduceOnly: number;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    3, 196, 90, 189, 193, 64, 228, 234,
  ]);

  static readonly layout = borsh.struct([
    borsh.u32("maxUsers"),
    borsh.u32("currentUsers"),
    borsh.u8("reduceOnly"),
    borsh.array(borsh.u8(), 31, "padding"),
  ]);

  constructor(fields: HighLeverageModeConfigFields) {
    this.maxUsers = fields.maxUsers;
    this.currentUsers = fields.currentUsers;
    this.reduceOnly = fields.reduceOnly;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<HighLeverageModeConfig | null> {
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
  ): Promise<Array<HighLeverageModeConfig | null>> {
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

  static decode(data: Buffer): HighLeverageModeConfig {
    if (!data.slice(0, 8).equals(HighLeverageModeConfig.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = HighLeverageModeConfig.layout.decode(data.slice(8));

    return new HighLeverageModeConfig({
      maxUsers: dec.maxUsers,
      currentUsers: dec.currentUsers,
      reduceOnly: dec.reduceOnly,
      padding: dec.padding,
    });
  }

  toJSON(): HighLeverageModeConfigJSON {
    return {
      maxUsers: this.maxUsers,
      currentUsers: this.currentUsers,
      reduceOnly: this.reduceOnly,
      padding: this.padding,
    };
  }

  static fromJSON(obj: HighLeverageModeConfigJSON): HighLeverageModeConfig {
    return new HighLeverageModeConfig({
      maxUsers: obj.maxUsers,
      currentUsers: obj.currentUsers,
      reduceOnly: obj.reduceOnly,
      padding: obj.padding,
    });
  }
}
