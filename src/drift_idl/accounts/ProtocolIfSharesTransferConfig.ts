import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ProtocolIfSharesTransferConfigFields {
  whitelistedSigners: Array<PublicKey>;
  maxTransferPerEpoch: BN;
  currentEpochTransfer: BN;
  nextEpochTs: BN;
  padding: Array<BN>;
}

export interface ProtocolIfSharesTransferConfigJSON {
  whitelistedSigners: Array<string>;
  maxTransferPerEpoch: string;
  currentEpochTransfer: string;
  nextEpochTs: string;
  padding: Array<string>;
}

export class ProtocolIfSharesTransferConfig {
  readonly whitelistedSigners: Array<PublicKey>;
  readonly maxTransferPerEpoch: BN;
  readonly currentEpochTransfer: BN;
  readonly nextEpochTs: BN;
  readonly padding: Array<BN>;

  static readonly discriminator = Buffer.from([
    188, 1, 213, 98, 23, 148, 30, 1,
  ]);

  static readonly layout = borsh.struct([
    borsh.array(borsh.publicKey(), 4, "whitelistedSigners"),
    borsh.u128("maxTransferPerEpoch"),
    borsh.u128("currentEpochTransfer"),
    borsh.i64("nextEpochTs"),
    borsh.array(borsh.u128(), 8, "padding"),
  ]);

  constructor(fields: ProtocolIfSharesTransferConfigFields) {
    this.whitelistedSigners = fields.whitelistedSigners;
    this.maxTransferPerEpoch = fields.maxTransferPerEpoch;
    this.currentEpochTransfer = fields.currentEpochTransfer;
    this.nextEpochTs = fields.nextEpochTs;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<ProtocolIfSharesTransferConfig | null> {
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
  ): Promise<Array<ProtocolIfSharesTransferConfig | null>> {
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

  static decode(data: Buffer): ProtocolIfSharesTransferConfig {
    if (
      !data.slice(0, 8).equals(ProtocolIfSharesTransferConfig.discriminator)
    ) {
      throw new Error("invalid account discriminator");
    }

    const dec = ProtocolIfSharesTransferConfig.layout.decode(data.slice(8));

    return new ProtocolIfSharesTransferConfig({
      whitelistedSigners: dec.whitelistedSigners,
      maxTransferPerEpoch: dec.maxTransferPerEpoch,
      currentEpochTransfer: dec.currentEpochTransfer,
      nextEpochTs: dec.nextEpochTs,
      padding: dec.padding,
    });
  }

  toJSON(): ProtocolIfSharesTransferConfigJSON {
    return {
      whitelistedSigners: this.whitelistedSigners.map((item) =>
        item.toString()
      ),
      maxTransferPerEpoch: this.maxTransferPerEpoch.toString(),
      currentEpochTransfer: this.currentEpochTransfer.toString(),
      nextEpochTs: this.nextEpochTs.toString(),
      padding: this.padding.map((item) => item.toString()),
    };
  }

  static fromJSON(
    obj: ProtocolIfSharesTransferConfigJSON
  ): ProtocolIfSharesTransferConfig {
    return new ProtocolIfSharesTransferConfig({
      whitelistedSigners: obj.whitelistedSigners.map(
        (item) => new PublicKey(item)
      ),
      maxTransferPerEpoch: new BN(obj.maxTransferPerEpoch),
      currentEpochTransfer: new BN(obj.currentEpochTransfer),
      nextEpochTs: new BN(obj.nextEpochTs),
      padding: obj.padding.map((item) => new BN(item)),
    });
  }
}
