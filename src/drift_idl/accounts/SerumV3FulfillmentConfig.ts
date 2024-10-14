import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface SerumV3FulfillmentConfigFields {
  pubkey: PublicKey;
  serumProgramId: PublicKey;
  serumMarket: PublicKey;
  serumRequestQueue: PublicKey;
  serumEventQueue: PublicKey;
  serumBids: PublicKey;
  serumAsks: PublicKey;
  serumBaseVault: PublicKey;
  serumQuoteVault: PublicKey;
  serumOpenOrders: PublicKey;
  serumSignerNonce: BN;
  marketIndex: number;
  fulfillmentType: types.SpotFulfillmentTypeKind;
  status: types.SpotFulfillmentConfigStatusKind;
  padding: Array<number>;
}

export interface SerumV3FulfillmentConfigJSON {
  pubkey: string;
  serumProgramId: string;
  serumMarket: string;
  serumRequestQueue: string;
  serumEventQueue: string;
  serumBids: string;
  serumAsks: string;
  serumBaseVault: string;
  serumQuoteVault: string;
  serumOpenOrders: string;
  serumSignerNonce: string;
  marketIndex: number;
  fulfillmentType: types.SpotFulfillmentTypeJSON;
  status: types.SpotFulfillmentConfigStatusJSON;
  padding: Array<number>;
}

export class SerumV3FulfillmentConfig {
  readonly pubkey: PublicKey;
  readonly serumProgramId: PublicKey;
  readonly serumMarket: PublicKey;
  readonly serumRequestQueue: PublicKey;
  readonly serumEventQueue: PublicKey;
  readonly serumBids: PublicKey;
  readonly serumAsks: PublicKey;
  readonly serumBaseVault: PublicKey;
  readonly serumQuoteVault: PublicKey;
  readonly serumOpenOrders: PublicKey;
  readonly serumSignerNonce: BN;
  readonly marketIndex: number;
  readonly fulfillmentType: types.SpotFulfillmentTypeKind;
  readonly status: types.SpotFulfillmentConfigStatusKind;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    65, 160, 197, 112, 239, 168, 103, 185,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("pubkey"),
    borsh.publicKey("serumProgramId"),
    borsh.publicKey("serumMarket"),
    borsh.publicKey("serumRequestQueue"),
    borsh.publicKey("serumEventQueue"),
    borsh.publicKey("serumBids"),
    borsh.publicKey("serumAsks"),
    borsh.publicKey("serumBaseVault"),
    borsh.publicKey("serumQuoteVault"),
    borsh.publicKey("serumOpenOrders"),
    borsh.u64("serumSignerNonce"),
    borsh.u16("marketIndex"),
    types.SpotFulfillmentType.layout("fulfillmentType"),
    types.SpotFulfillmentConfigStatus.layout("status"),
    borsh.array(borsh.u8(), 4, "padding"),
  ]);

  constructor(fields: SerumV3FulfillmentConfigFields) {
    this.pubkey = fields.pubkey;
    this.serumProgramId = fields.serumProgramId;
    this.serumMarket = fields.serumMarket;
    this.serumRequestQueue = fields.serumRequestQueue;
    this.serumEventQueue = fields.serumEventQueue;
    this.serumBids = fields.serumBids;
    this.serumAsks = fields.serumAsks;
    this.serumBaseVault = fields.serumBaseVault;
    this.serumQuoteVault = fields.serumQuoteVault;
    this.serumOpenOrders = fields.serumOpenOrders;
    this.serumSignerNonce = fields.serumSignerNonce;
    this.marketIndex = fields.marketIndex;
    this.fulfillmentType = fields.fulfillmentType;
    this.status = fields.status;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<SerumV3FulfillmentConfig | null> {
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
  ): Promise<Array<SerumV3FulfillmentConfig | null>> {
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

  static decode(data: Buffer): SerumV3FulfillmentConfig {
    if (!data.slice(0, 8).equals(SerumV3FulfillmentConfig.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = SerumV3FulfillmentConfig.layout.decode(data.slice(8));

    return new SerumV3FulfillmentConfig({
      pubkey: dec.pubkey,
      serumProgramId: dec.serumProgramId,
      serumMarket: dec.serumMarket,
      serumRequestQueue: dec.serumRequestQueue,
      serumEventQueue: dec.serumEventQueue,
      serumBids: dec.serumBids,
      serumAsks: dec.serumAsks,
      serumBaseVault: dec.serumBaseVault,
      serumQuoteVault: dec.serumQuoteVault,
      serumOpenOrders: dec.serumOpenOrders,
      serumSignerNonce: dec.serumSignerNonce,
      marketIndex: dec.marketIndex,
      fulfillmentType: types.SpotFulfillmentType.fromDecoded(
        dec.fulfillmentType
      ),
      status: types.SpotFulfillmentConfigStatus.fromDecoded(dec.status),
      padding: dec.padding,
    });
  }

  toJSON(): SerumV3FulfillmentConfigJSON {
    return {
      pubkey: this.pubkey.toString(),
      serumProgramId: this.serumProgramId.toString(),
      serumMarket: this.serumMarket.toString(),
      serumRequestQueue: this.serumRequestQueue.toString(),
      serumEventQueue: this.serumEventQueue.toString(),
      serumBids: this.serumBids.toString(),
      serumAsks: this.serumAsks.toString(),
      serumBaseVault: this.serumBaseVault.toString(),
      serumQuoteVault: this.serumQuoteVault.toString(),
      serumOpenOrders: this.serumOpenOrders.toString(),
      serumSignerNonce: this.serumSignerNonce.toString(),
      marketIndex: this.marketIndex,
      fulfillmentType: this.fulfillmentType.toJSON(),
      status: this.status.toJSON(),
      padding: this.padding,
    };
  }

  static fromJSON(obj: SerumV3FulfillmentConfigJSON): SerumV3FulfillmentConfig {
    return new SerumV3FulfillmentConfig({
      pubkey: new PublicKey(obj.pubkey),
      serumProgramId: new PublicKey(obj.serumProgramId),
      serumMarket: new PublicKey(obj.serumMarket),
      serumRequestQueue: new PublicKey(obj.serumRequestQueue),
      serumEventQueue: new PublicKey(obj.serumEventQueue),
      serumBids: new PublicKey(obj.serumBids),
      serumAsks: new PublicKey(obj.serumAsks),
      serumBaseVault: new PublicKey(obj.serumBaseVault),
      serumQuoteVault: new PublicKey(obj.serumQuoteVault),
      serumOpenOrders: new PublicKey(obj.serumOpenOrders),
      serumSignerNonce: new BN(obj.serumSignerNonce),
      marketIndex: obj.marketIndex,
      fulfillmentType: types.SpotFulfillmentType.fromJSON(obj.fulfillmentType),
      status: types.SpotFulfillmentConfigStatus.fromJSON(obj.status),
      padding: obj.padding,
    });
  }
}
