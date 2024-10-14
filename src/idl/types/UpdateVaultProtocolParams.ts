import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface UpdateVaultProtocolParamsFields {
  protocolFee: BN | null;
  protocolProfitShare: number | null;
}

export interface UpdateVaultProtocolParamsJSON {
  protocolFee: string | null;
  protocolProfitShare: number | null;
}

export class UpdateVaultProtocolParams {
  readonly protocolFee: BN | null;
  readonly protocolProfitShare: number | null;

  constructor(fields: UpdateVaultProtocolParamsFields) {
    this.protocolFee = fields.protocolFee;
    this.protocolProfitShare = fields.protocolProfitShare;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.option(borsh.u64(), "protocolFee"),
        borsh.option(borsh.u32(), "protocolProfitShare"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new UpdateVaultProtocolParams({
      protocolFee: obj.protocolFee,
      protocolProfitShare: obj.protocolProfitShare,
    });
  }

  static toEncodable(fields: UpdateVaultProtocolParamsFields) {
    return {
      protocolFee: fields.protocolFee,
      protocolProfitShare: fields.protocolProfitShare,
    };
  }

  toJSON(): UpdateVaultProtocolParamsJSON {
    return {
      protocolFee: (this.protocolFee && this.protocolFee.toString()) || null,
      protocolProfitShare: this.protocolProfitShare,
    };
  }

  static fromJSON(
    obj: UpdateVaultProtocolParamsJSON
  ): UpdateVaultProtocolParams {
    return new UpdateVaultProtocolParams({
      protocolFee: (obj.protocolFee && new BN(obj.protocolFee)) || null,
      protocolProfitShare: obj.protocolProfitShare,
    });
  }

  toEncodable() {
    return UpdateVaultProtocolParams.toEncodable(this);
  }
}
