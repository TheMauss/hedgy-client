import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PrelaunchOracleFields {
  price: BN;
  maxPrice: BN;
  confidence: BN;
  lastUpdateSlot: BN;
  ammLastUpdateSlot: BN;
  perpMarketIndex: number;
  padding: Array<number>;
}

export interface PrelaunchOracleJSON {
  price: string;
  maxPrice: string;
  confidence: string;
  lastUpdateSlot: string;
  ammLastUpdateSlot: string;
  perpMarketIndex: number;
  padding: Array<number>;
}

export class PrelaunchOracle {
  readonly price: BN;
  readonly maxPrice: BN;
  readonly confidence: BN;
  readonly lastUpdateSlot: BN;
  readonly ammLastUpdateSlot: BN;
  readonly perpMarketIndex: number;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    92, 14, 139, 234, 72, 244, 68, 26,
  ]);

  static readonly layout = borsh.struct([
    borsh.i64("price"),
    borsh.i64("maxPrice"),
    borsh.u64("confidence"),
    borsh.u64("lastUpdateSlot"),
    borsh.u64("ammLastUpdateSlot"),
    borsh.u16("perpMarketIndex"),
    borsh.array(borsh.u8(), 70, "padding"),
  ]);

  constructor(fields: PrelaunchOracleFields) {
    this.price = fields.price;
    this.maxPrice = fields.maxPrice;
    this.confidence = fields.confidence;
    this.lastUpdateSlot = fields.lastUpdateSlot;
    this.ammLastUpdateSlot = fields.ammLastUpdateSlot;
    this.perpMarketIndex = fields.perpMarketIndex;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<PrelaunchOracle | null> {
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
  ): Promise<Array<PrelaunchOracle | null>> {
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

  static decode(data: Buffer): PrelaunchOracle {
    if (!data.slice(0, 8).equals(PrelaunchOracle.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = PrelaunchOracle.layout.decode(data.slice(8));

    return new PrelaunchOracle({
      price: dec.price,
      maxPrice: dec.maxPrice,
      confidence: dec.confidence,
      lastUpdateSlot: dec.lastUpdateSlot,
      ammLastUpdateSlot: dec.ammLastUpdateSlot,
      perpMarketIndex: dec.perpMarketIndex,
      padding: dec.padding,
    });
  }

  toJSON(): PrelaunchOracleJSON {
    return {
      price: this.price.toString(),
      maxPrice: this.maxPrice.toString(),
      confidence: this.confidence.toString(),
      lastUpdateSlot: this.lastUpdateSlot.toString(),
      ammLastUpdateSlot: this.ammLastUpdateSlot.toString(),
      perpMarketIndex: this.perpMarketIndex,
      padding: this.padding,
    };
  }

  static fromJSON(obj: PrelaunchOracleJSON): PrelaunchOracle {
    return new PrelaunchOracle({
      price: new BN(obj.price),
      maxPrice: new BN(obj.maxPrice),
      confidence: new BN(obj.confidence),
      lastUpdateSlot: new BN(obj.lastUpdateSlot),
      ammLastUpdateSlot: new BN(obj.ammLastUpdateSlot),
      perpMarketIndex: obj.perpMarketIndex,
      padding: obj.padding,
    });
  }
}
