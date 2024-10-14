import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PhoenixV1FulfillmentConfigFields {
  pubkey: PublicKey;
  phoenixProgramId: PublicKey;
  phoenixLogAuthority: PublicKey;
  phoenixMarket: PublicKey;
  phoenixBaseVault: PublicKey;
  phoenixQuoteVault: PublicKey;
  marketIndex: number;
  fulfillmentType: types.SpotFulfillmentTypeKind;
  status: types.SpotFulfillmentConfigStatusKind;
  padding: Array<number>;
}

export interface PhoenixV1FulfillmentConfigJSON {
  pubkey: string;
  phoenixProgramId: string;
  phoenixLogAuthority: string;
  phoenixMarket: string;
  phoenixBaseVault: string;
  phoenixQuoteVault: string;
  marketIndex: number;
  fulfillmentType: types.SpotFulfillmentTypeJSON;
  status: types.SpotFulfillmentConfigStatusJSON;
  padding: Array<number>;
}

export class PhoenixV1FulfillmentConfig {
  readonly pubkey: PublicKey;
  readonly phoenixProgramId: PublicKey;
  readonly phoenixLogAuthority: PublicKey;
  readonly phoenixMarket: PublicKey;
  readonly phoenixBaseVault: PublicKey;
  readonly phoenixQuoteVault: PublicKey;
  readonly marketIndex: number;
  readonly fulfillmentType: types.SpotFulfillmentTypeKind;
  readonly status: types.SpotFulfillmentConfigStatusKind;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    233, 45, 62, 40, 35, 129, 48, 72,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("pubkey"),
    borsh.publicKey("phoenixProgramId"),
    borsh.publicKey("phoenixLogAuthority"),
    borsh.publicKey("phoenixMarket"),
    borsh.publicKey("phoenixBaseVault"),
    borsh.publicKey("phoenixQuoteVault"),
    borsh.u16("marketIndex"),
    types.SpotFulfillmentType.layout("fulfillmentType"),
    types.SpotFulfillmentConfigStatus.layout("status"),
    borsh.array(borsh.u8(), 4, "padding"),
  ]);

  constructor(fields: PhoenixV1FulfillmentConfigFields) {
    this.pubkey = fields.pubkey;
    this.phoenixProgramId = fields.phoenixProgramId;
    this.phoenixLogAuthority = fields.phoenixLogAuthority;
    this.phoenixMarket = fields.phoenixMarket;
    this.phoenixBaseVault = fields.phoenixBaseVault;
    this.phoenixQuoteVault = fields.phoenixQuoteVault;
    this.marketIndex = fields.marketIndex;
    this.fulfillmentType = fields.fulfillmentType;
    this.status = fields.status;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<PhoenixV1FulfillmentConfig | null> {
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
  ): Promise<Array<PhoenixV1FulfillmentConfig | null>> {
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

  static decode(data: Buffer): PhoenixV1FulfillmentConfig {
    if (!data.slice(0, 8).equals(PhoenixV1FulfillmentConfig.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = PhoenixV1FulfillmentConfig.layout.decode(data.slice(8));

    return new PhoenixV1FulfillmentConfig({
      pubkey: dec.pubkey,
      phoenixProgramId: dec.phoenixProgramId,
      phoenixLogAuthority: dec.phoenixLogAuthority,
      phoenixMarket: dec.phoenixMarket,
      phoenixBaseVault: dec.phoenixBaseVault,
      phoenixQuoteVault: dec.phoenixQuoteVault,
      marketIndex: dec.marketIndex,
      fulfillmentType: types.SpotFulfillmentType.fromDecoded(
        dec.fulfillmentType
      ),
      status: types.SpotFulfillmentConfigStatus.fromDecoded(dec.status),
      padding: dec.padding,
    });
  }

  toJSON(): PhoenixV1FulfillmentConfigJSON {
    return {
      pubkey: this.pubkey.toString(),
      phoenixProgramId: this.phoenixProgramId.toString(),
      phoenixLogAuthority: this.phoenixLogAuthority.toString(),
      phoenixMarket: this.phoenixMarket.toString(),
      phoenixBaseVault: this.phoenixBaseVault.toString(),
      phoenixQuoteVault: this.phoenixQuoteVault.toString(),
      marketIndex: this.marketIndex,
      fulfillmentType: this.fulfillmentType.toJSON(),
      status: this.status.toJSON(),
      padding: this.padding,
    };
  }

  static fromJSON(
    obj: PhoenixV1FulfillmentConfigJSON
  ): PhoenixV1FulfillmentConfig {
    return new PhoenixV1FulfillmentConfig({
      pubkey: new PublicKey(obj.pubkey),
      phoenixProgramId: new PublicKey(obj.phoenixProgramId),
      phoenixLogAuthority: new PublicKey(obj.phoenixLogAuthority),
      phoenixMarket: new PublicKey(obj.phoenixMarket),
      phoenixBaseVault: new PublicKey(obj.phoenixBaseVault),
      phoenixQuoteVault: new PublicKey(obj.phoenixQuoteVault),
      marketIndex: obj.marketIndex,
      fulfillmentType: types.SpotFulfillmentType.fromJSON(obj.fulfillmentType),
      status: types.SpotFulfillmentConfigStatus.fromJSON(obj.status),
      padding: obj.padding,
    });
  }
}
