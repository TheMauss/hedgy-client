import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface UpdateVaultParamsFields {
  redeemPeriod: BN | null;
  maxTokens: BN | null;
  managementFee: BN | null;
  minDepositAmount: BN | null;
  profitShare: number | null;
  hurdleRate: number | null;
  permissioned: boolean | null;
}

export interface UpdateVaultParamsJSON {
  redeemPeriod: string | null;
  maxTokens: string | null;
  managementFee: string | null;
  minDepositAmount: string | null;
  profitShare: number | null;
  hurdleRate: number | null;
  permissioned: boolean | null;
}

export class UpdateVaultParams {
  readonly redeemPeriod: BN | null;
  readonly maxTokens: BN | null;
  readonly managementFee: BN | null;
  readonly minDepositAmount: BN | null;
  readonly profitShare: number | null;
  readonly hurdleRate: number | null;
  readonly permissioned: boolean | null;

  constructor(fields: UpdateVaultParamsFields) {
    this.redeemPeriod = fields.redeemPeriod;
    this.maxTokens = fields.maxTokens;
    this.managementFee = fields.managementFee;
    this.minDepositAmount = fields.minDepositAmount;
    this.profitShare = fields.profitShare;
    this.hurdleRate = fields.hurdleRate;
    this.permissioned = fields.permissioned;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.option(borsh.i64(), "redeemPeriod"),
        borsh.option(borsh.u64(), "maxTokens"),
        borsh.option(borsh.i64(), "managementFee"),
        borsh.option(borsh.u64(), "minDepositAmount"),
        borsh.option(borsh.u32(), "profitShare"),
        borsh.option(borsh.u32(), "hurdleRate"),
        borsh.option(borsh.bool(), "permissioned"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new UpdateVaultParams({
      redeemPeriod: obj.redeemPeriod,
      maxTokens: obj.maxTokens,
      managementFee: obj.managementFee,
      minDepositAmount: obj.minDepositAmount,
      profitShare: obj.profitShare,
      hurdleRate: obj.hurdleRate,
      permissioned: obj.permissioned,
    });
  }

  static toEncodable(fields: UpdateVaultParamsFields) {
    return {
      redeemPeriod: fields.redeemPeriod,
      maxTokens: fields.maxTokens,
      managementFee: fields.managementFee,
      minDepositAmount: fields.minDepositAmount,
      profitShare: fields.profitShare,
      hurdleRate: fields.hurdleRate,
      permissioned: fields.permissioned,
    };
  }

  toJSON(): UpdateVaultParamsJSON {
    return {
      redeemPeriod: (this.redeemPeriod && this.redeemPeriod.toString()) || null,
      maxTokens: (this.maxTokens && this.maxTokens.toString()) || null,
      managementFee:
        (this.managementFee && this.managementFee.toString()) || null,
      minDepositAmount:
        (this.minDepositAmount && this.minDepositAmount.toString()) || null,
      profitShare: this.profitShare,
      hurdleRate: this.hurdleRate,
      permissioned: this.permissioned,
    };
  }

  static fromJSON(obj: UpdateVaultParamsJSON): UpdateVaultParams {
    return new UpdateVaultParams({
      redeemPeriod: (obj.redeemPeriod && new BN(obj.redeemPeriod)) || null,
      maxTokens: (obj.maxTokens && new BN(obj.maxTokens)) || null,
      managementFee: (obj.managementFee && new BN(obj.managementFee)) || null,
      minDepositAmount:
        (obj.minDepositAmount && new BN(obj.minDepositAmount)) || null,
      profitShare: obj.profitShare,
      hurdleRate: obj.hurdleRate,
      permissioned: obj.permissioned,
    });
  }

  toEncodable() {
    return UpdateVaultParams.toEncodable(this);
  }
}
