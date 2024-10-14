import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface OpenbookV2FulfillmentConfigFields {
  pubkey: PublicKey;
  openbookV2ProgramId: PublicKey;
  openbookV2Market: PublicKey;
  openbookV2MarketAuthority: PublicKey;
  openbookV2EventHeap: PublicKey;
  openbookV2Bids: PublicKey;
  openbookV2Asks: PublicKey;
  openbookV2BaseVault: PublicKey;
  openbookV2QuoteVault: PublicKey;
  marketIndex: number;
  fulfillmentType: types.SpotFulfillmentTypeKind;
  status: types.SpotFulfillmentConfigStatusKind;
  padding: Array<number>;
}

export interface OpenbookV2FulfillmentConfigJSON {
  pubkey: string;
  openbookV2ProgramId: string;
  openbookV2Market: string;
  openbookV2MarketAuthority: string;
  openbookV2EventHeap: string;
  openbookV2Bids: string;
  openbookV2Asks: string;
  openbookV2BaseVault: string;
  openbookV2QuoteVault: string;
  marketIndex: number;
  fulfillmentType: types.SpotFulfillmentTypeJSON;
  status: types.SpotFulfillmentConfigStatusJSON;
  padding: Array<number>;
}

export class OpenbookV2FulfillmentConfig {
  readonly pubkey: PublicKey;
  readonly openbookV2ProgramId: PublicKey;
  readonly openbookV2Market: PublicKey;
  readonly openbookV2MarketAuthority: PublicKey;
  readonly openbookV2EventHeap: PublicKey;
  readonly openbookV2Bids: PublicKey;
  readonly openbookV2Asks: PublicKey;
  readonly openbookV2BaseVault: PublicKey;
  readonly openbookV2QuoteVault: PublicKey;
  readonly marketIndex: number;
  readonly fulfillmentType: types.SpotFulfillmentTypeKind;
  readonly status: types.SpotFulfillmentConfigStatusKind;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    3, 43, 58, 106, 131, 132, 199, 171,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("pubkey"),
    borsh.publicKey("openbookV2ProgramId"),
    borsh.publicKey("openbookV2Market"),
    borsh.publicKey("openbookV2MarketAuthority"),
    borsh.publicKey("openbookV2EventHeap"),
    borsh.publicKey("openbookV2Bids"),
    borsh.publicKey("openbookV2Asks"),
    borsh.publicKey("openbookV2BaseVault"),
    borsh.publicKey("openbookV2QuoteVault"),
    borsh.u16("marketIndex"),
    types.SpotFulfillmentType.layout("fulfillmentType"),
    types.SpotFulfillmentConfigStatus.layout("status"),
    borsh.array(borsh.u8(), 4, "padding"),
  ]);

  constructor(fields: OpenbookV2FulfillmentConfigFields) {
    this.pubkey = fields.pubkey;
    this.openbookV2ProgramId = fields.openbookV2ProgramId;
    this.openbookV2Market = fields.openbookV2Market;
    this.openbookV2MarketAuthority = fields.openbookV2MarketAuthority;
    this.openbookV2EventHeap = fields.openbookV2EventHeap;
    this.openbookV2Bids = fields.openbookV2Bids;
    this.openbookV2Asks = fields.openbookV2Asks;
    this.openbookV2BaseVault = fields.openbookV2BaseVault;
    this.openbookV2QuoteVault = fields.openbookV2QuoteVault;
    this.marketIndex = fields.marketIndex;
    this.fulfillmentType = fields.fulfillmentType;
    this.status = fields.status;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<OpenbookV2FulfillmentConfig | null> {
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
  ): Promise<Array<OpenbookV2FulfillmentConfig | null>> {
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

  static decode(data: Buffer): OpenbookV2FulfillmentConfig {
    if (!data.slice(0, 8).equals(OpenbookV2FulfillmentConfig.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = OpenbookV2FulfillmentConfig.layout.decode(data.slice(8));

    return new OpenbookV2FulfillmentConfig({
      pubkey: dec.pubkey,
      openbookV2ProgramId: dec.openbookV2ProgramId,
      openbookV2Market: dec.openbookV2Market,
      openbookV2MarketAuthority: dec.openbookV2MarketAuthority,
      openbookV2EventHeap: dec.openbookV2EventHeap,
      openbookV2Bids: dec.openbookV2Bids,
      openbookV2Asks: dec.openbookV2Asks,
      openbookV2BaseVault: dec.openbookV2BaseVault,
      openbookV2QuoteVault: dec.openbookV2QuoteVault,
      marketIndex: dec.marketIndex,
      fulfillmentType: types.SpotFulfillmentType.fromDecoded(
        dec.fulfillmentType
      ),
      status: types.SpotFulfillmentConfigStatus.fromDecoded(dec.status),
      padding: dec.padding,
    });
  }

  toJSON(): OpenbookV2FulfillmentConfigJSON {
    return {
      pubkey: this.pubkey.toString(),
      openbookV2ProgramId: this.openbookV2ProgramId.toString(),
      openbookV2Market: this.openbookV2Market.toString(),
      openbookV2MarketAuthority: this.openbookV2MarketAuthority.toString(),
      openbookV2EventHeap: this.openbookV2EventHeap.toString(),
      openbookV2Bids: this.openbookV2Bids.toString(),
      openbookV2Asks: this.openbookV2Asks.toString(),
      openbookV2BaseVault: this.openbookV2BaseVault.toString(),
      openbookV2QuoteVault: this.openbookV2QuoteVault.toString(),
      marketIndex: this.marketIndex,
      fulfillmentType: this.fulfillmentType.toJSON(),
      status: this.status.toJSON(),
      padding: this.padding,
    };
  }

  static fromJSON(
    obj: OpenbookV2FulfillmentConfigJSON
  ): OpenbookV2FulfillmentConfig {
    return new OpenbookV2FulfillmentConfig({
      pubkey: new PublicKey(obj.pubkey),
      openbookV2ProgramId: new PublicKey(obj.openbookV2ProgramId),
      openbookV2Market: new PublicKey(obj.openbookV2Market),
      openbookV2MarketAuthority: new PublicKey(obj.openbookV2MarketAuthority),
      openbookV2EventHeap: new PublicKey(obj.openbookV2EventHeap),
      openbookV2Bids: new PublicKey(obj.openbookV2Bids),
      openbookV2Asks: new PublicKey(obj.openbookV2Asks),
      openbookV2BaseVault: new PublicKey(obj.openbookV2BaseVault),
      openbookV2QuoteVault: new PublicKey(obj.openbookV2QuoteVault),
      marketIndex: obj.marketIndex,
      fulfillmentType: types.SpotFulfillmentType.fromJSON(obj.fulfillmentType),
      status: types.SpotFulfillmentConfigStatus.fromJSON(obj.status),
      padding: obj.padding,
    });
  }
}
