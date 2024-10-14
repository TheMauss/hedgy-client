import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface VaultProtocolParamsFields {
  protocol: PublicKey;
  protocolFee: BN;
  protocolProfitShare: number;
}

export interface VaultProtocolParamsJSON {
  protocol: string;
  protocolFee: string;
  protocolProfitShare: number;
}

export class VaultProtocolParams {
  readonly protocol: PublicKey;
  readonly protocolFee: BN;
  readonly protocolProfitShare: number;

  constructor(fields: VaultProtocolParamsFields) {
    this.protocol = fields.protocol;
    this.protocolFee = fields.protocolFee;
    this.protocolProfitShare = fields.protocolProfitShare;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.publicKey("protocol"),
        borsh.u64("protocolFee"),
        borsh.u32("protocolProfitShare"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new VaultProtocolParams({
      protocol: obj.protocol,
      protocolFee: obj.protocolFee,
      protocolProfitShare: obj.protocolProfitShare,
    });
  }

  static toEncodable(fields: VaultProtocolParamsFields) {
    return {
      protocol: fields.protocol,
      protocolFee: fields.protocolFee,
      protocolProfitShare: fields.protocolProfitShare,
    };
  }

  toJSON(): VaultProtocolParamsJSON {
    return {
      protocol: this.protocol.toString(),
      protocolFee: this.protocolFee.toString(),
      protocolProfitShare: this.protocolProfitShare,
    };
  }

  static fromJSON(obj: VaultProtocolParamsJSON): VaultProtocolParams {
    return new VaultProtocolParams({
      protocol: new PublicKey(obj.protocol),
      protocolFee: new BN(obj.protocolFee),
      protocolProfitShare: obj.protocolProfitShare,
    });
  }

  toEncodable() {
    return VaultProtocolParams.toEncodable(this);
  }
}
