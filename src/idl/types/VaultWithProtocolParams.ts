import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface VaultWithProtocolParamsFields {
  name: Array<number>;
  redeemPeriod: BN;
  maxTokens: BN;
  managementFee: BN;
  minDepositAmount: BN;
  profitShare: number;
  hurdleRate: number;
  spotMarketIndex: number;
  permissioned: boolean;
  vaultProtocol: types.VaultProtocolParamsFields;
}

export interface VaultWithProtocolParamsJSON {
  name: Array<number>;
  redeemPeriod: string;
  maxTokens: string;
  managementFee: string;
  minDepositAmount: string;
  profitShare: number;
  hurdleRate: number;
  spotMarketIndex: number;
  permissioned: boolean;
  vaultProtocol: types.VaultProtocolParamsJSON;
}

export class VaultWithProtocolParams {
  readonly name: Array<number>;
  readonly redeemPeriod: BN;
  readonly maxTokens: BN;
  readonly managementFee: BN;
  readonly minDepositAmount: BN;
  readonly profitShare: number;
  readonly hurdleRate: number;
  readonly spotMarketIndex: number;
  readonly permissioned: boolean;
  readonly vaultProtocol: types.VaultProtocolParams;

  constructor(fields: VaultWithProtocolParamsFields) {
    this.name = fields.name;
    this.redeemPeriod = fields.redeemPeriod;
    this.maxTokens = fields.maxTokens;
    this.managementFee = fields.managementFee;
    this.minDepositAmount = fields.minDepositAmount;
    this.profitShare = fields.profitShare;
    this.hurdleRate = fields.hurdleRate;
    this.spotMarketIndex = fields.spotMarketIndex;
    this.permissioned = fields.permissioned;
    this.vaultProtocol = new types.VaultProtocolParams({
      ...fields.vaultProtocol,
    });
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.array(borsh.u8(), 32, "name"),
        borsh.i64("redeemPeriod"),
        borsh.u64("maxTokens"),
        borsh.i64("managementFee"),
        borsh.u64("minDepositAmount"),
        borsh.u32("profitShare"),
        borsh.u32("hurdleRate"),
        borsh.u16("spotMarketIndex"),
        borsh.bool("permissioned"),
        types.VaultProtocolParams.layout("vaultProtocol"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new VaultWithProtocolParams({
      name: obj.name,
      redeemPeriod: obj.redeemPeriod,
      maxTokens: obj.maxTokens,
      managementFee: obj.managementFee,
      minDepositAmount: obj.minDepositAmount,
      profitShare: obj.profitShare,
      hurdleRate: obj.hurdleRate,
      spotMarketIndex: obj.spotMarketIndex,
      permissioned: obj.permissioned,
      vaultProtocol: types.VaultProtocolParams.fromDecoded(obj.vaultProtocol),
    });
  }

  static toEncodable(fields: VaultWithProtocolParamsFields) {
    return {
      name: fields.name,
      redeemPeriod: fields.redeemPeriod,
      maxTokens: fields.maxTokens,
      managementFee: fields.managementFee,
      minDepositAmount: fields.minDepositAmount,
      profitShare: fields.profitShare,
      hurdleRate: fields.hurdleRate,
      spotMarketIndex: fields.spotMarketIndex,
      permissioned: fields.permissioned,
      vaultProtocol: types.VaultProtocolParams.toEncodable(
        fields.vaultProtocol
      ),
    };
  }

  toJSON(): VaultWithProtocolParamsJSON {
    return {
      name: this.name,
      redeemPeriod: this.redeemPeriod.toString(),
      maxTokens: this.maxTokens.toString(),
      managementFee: this.managementFee.toString(),
      minDepositAmount: this.minDepositAmount.toString(),
      profitShare: this.profitShare,
      hurdleRate: this.hurdleRate,
      spotMarketIndex: this.spotMarketIndex,
      permissioned: this.permissioned,
      vaultProtocol: this.vaultProtocol.toJSON(),
    };
  }

  static fromJSON(obj: VaultWithProtocolParamsJSON): VaultWithProtocolParams {
    return new VaultWithProtocolParams({
      name: obj.name,
      redeemPeriod: new BN(obj.redeemPeriod),
      maxTokens: new BN(obj.maxTokens),
      managementFee: new BN(obj.managementFee),
      minDepositAmount: new BN(obj.minDepositAmount),
      profitShare: obj.profitShare,
      hurdleRate: obj.hurdleRate,
      spotMarketIndex: obj.spotMarketIndex,
      permissioned: obj.permissioned,
      vaultProtocol: types.VaultProtocolParams.fromJSON(obj.vaultProtocol),
    });
  }

  toEncodable() {
    return VaultWithProtocolParams.toEncodable(this);
  }
}
