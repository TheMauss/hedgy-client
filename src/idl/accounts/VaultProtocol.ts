import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface VaultProtocolFields {
  protocol: PublicKey;
  protocolProfitAndFeeShares: BN;
  protocolFee: BN;
  protocolTotalWithdraws: BN;
  protocolTotalFee: BN;
  protocolTotalProfitShare: BN;
  lastProtocolWithdrawRequest: types.WithdrawRequestFields;
  protocolProfitShare: number;
  bump: number;
  version: number;
  padding: Array<number>;
}

export interface VaultProtocolJSON {
  protocol: string;
  protocolProfitAndFeeShares: string;
  protocolFee: string;
  protocolTotalWithdraws: string;
  protocolTotalFee: string;
  protocolTotalProfitShare: string;
  lastProtocolWithdrawRequest: types.WithdrawRequestJSON;
  protocolProfitShare: number;
  bump: number;
  version: number;
  padding: Array<number>;
}

export class VaultProtocol {
  readonly protocol: PublicKey;
  readonly protocolProfitAndFeeShares: BN;
  readonly protocolFee: BN;
  readonly protocolTotalWithdraws: BN;
  readonly protocolTotalFee: BN;
  readonly protocolTotalProfitShare: BN;
  readonly lastProtocolWithdrawRequest: types.WithdrawRequest;
  readonly protocolProfitShare: number;
  readonly bump: number;
  readonly version: number;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    106, 130, 5, 195, 126, 82, 249, 53,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("protocol"),
    borsh.u128("protocolProfitAndFeeShares"),
    borsh.u64("protocolFee"),
    borsh.u64("protocolTotalWithdraws"),
    borsh.u64("protocolTotalFee"),
    borsh.u64("protocolTotalProfitShare"),
    types.WithdrawRequest.layout("lastProtocolWithdrawRequest"),
    borsh.u32("protocolProfitShare"),
    borsh.u8("bump"),
    borsh.u8("version"),
    borsh.array(borsh.u8(), 2, "padding"),
  ]);

  constructor(fields: VaultProtocolFields) {
    this.protocol = fields.protocol;
    this.protocolProfitAndFeeShares = fields.protocolProfitAndFeeShares;
    this.protocolFee = fields.protocolFee;
    this.protocolTotalWithdraws = fields.protocolTotalWithdraws;
    this.protocolTotalFee = fields.protocolTotalFee;
    this.protocolTotalProfitShare = fields.protocolTotalProfitShare;
    this.lastProtocolWithdrawRequest = new types.WithdrawRequest({
      ...fields.lastProtocolWithdrawRequest,
    });
    this.protocolProfitShare = fields.protocolProfitShare;
    this.bump = fields.bump;
    this.version = fields.version;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<VaultProtocol | null> {
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
  ): Promise<Array<VaultProtocol | null>> {
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

  static decode(data: Buffer): VaultProtocol {
    if (!data.slice(0, 8).equals(VaultProtocol.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = VaultProtocol.layout.decode(data.slice(8));

    return new VaultProtocol({
      protocol: dec.protocol,
      protocolProfitAndFeeShares: dec.protocolProfitAndFeeShares,
      protocolFee: dec.protocolFee,
      protocolTotalWithdraws: dec.protocolTotalWithdraws,
      protocolTotalFee: dec.protocolTotalFee,
      protocolTotalProfitShare: dec.protocolTotalProfitShare,
      lastProtocolWithdrawRequest: types.WithdrawRequest.fromDecoded(
        dec.lastProtocolWithdrawRequest
      ),
      protocolProfitShare: dec.protocolProfitShare,
      bump: dec.bump,
      version: dec.version,
      padding: dec.padding,
    });
  }

  toJSON(): VaultProtocolJSON {
    return {
      protocol: this.protocol.toString(),
      protocolProfitAndFeeShares: this.protocolProfitAndFeeShares.toString(),
      protocolFee: this.protocolFee.toString(),
      protocolTotalWithdraws: this.protocolTotalWithdraws.toString(),
      protocolTotalFee: this.protocolTotalFee.toString(),
      protocolTotalProfitShare: this.protocolTotalProfitShare.toString(),
      lastProtocolWithdrawRequest: this.lastProtocolWithdrawRequest.toJSON(),
      protocolProfitShare: this.protocolProfitShare,
      bump: this.bump,
      version: this.version,
      padding: this.padding,
    };
  }

  static fromJSON(obj: VaultProtocolJSON): VaultProtocol {
    return new VaultProtocol({
      protocol: new PublicKey(obj.protocol),
      protocolProfitAndFeeShares: new BN(obj.protocolProfitAndFeeShares),
      protocolFee: new BN(obj.protocolFee),
      protocolTotalWithdraws: new BN(obj.protocolTotalWithdraws),
      protocolTotalFee: new BN(obj.protocolTotalFee),
      protocolTotalProfitShare: new BN(obj.protocolTotalProfitShare),
      lastProtocolWithdrawRequest: types.WithdrawRequest.fromJSON(
        obj.lastProtocolWithdrawRequest
      ),
      protocolProfitShare: obj.protocolProfitShare,
      bump: obj.bump,
      version: obj.version,
      padding: obj.padding,
    });
  }
}
