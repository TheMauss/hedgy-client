import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface LiquidityProviderAccountFields {
  isInitialized: boolean;
  providersWallet: PublicKey;
  lastDepositEpoch: BN;
  lastWithdrawFeeEpoch: BN;
  providerDepositedAmount: BN;
  solEarned: BN;
  lastKnownCumulativeFeeRate: BN;
  lastKnownPnlRate: BN;
  isActive: boolean;
  withdrawalRequestAmount: BN;
  withdrawalRequestEpoch: BN;
}

export interface LiquidityProviderAccountJSON {
  isInitialized: boolean;
  providersWallet: string;
  lastDepositEpoch: string;
  lastWithdrawFeeEpoch: string;
  providerDepositedAmount: string;
  solEarned: string;
  lastKnownCumulativeFeeRate: string;
  lastKnownPnlRate: string;
  isActive: boolean;
  withdrawalRequestAmount: string;
  withdrawalRequestEpoch: string;
}

export class LiquidityProviderAccount {
  readonly isInitialized: boolean;
  readonly providersWallet: PublicKey;
  readonly lastDepositEpoch: BN;
  readonly lastWithdrawFeeEpoch: BN;
  readonly providerDepositedAmount: BN;
  readonly solEarned: BN;
  readonly lastKnownCumulativeFeeRate: BN;
  readonly lastKnownPnlRate: BN;
  readonly isActive: boolean;
  readonly withdrawalRequestAmount: BN;
  readonly withdrawalRequestEpoch: BN;

  static readonly discriminator = Buffer.from([
    37, 78, 108, 229, 124, 38, 135, 141,
  ]);

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.publicKey("providersWallet"),
    borsh.u64("lastDepositEpoch"),
    borsh.u64("lastWithdrawFeeEpoch"),
    borsh.u64("providerDepositedAmount"),
    borsh.i64("solEarned"),
    borsh.u64("lastKnownCumulativeFeeRate"),
    borsh.i64("lastKnownPnlRate"),
    borsh.bool("isActive"),
    borsh.u64("withdrawalRequestAmount"),
    borsh.u64("withdrawalRequestEpoch"),
  ]);

  constructor(fields: LiquidityProviderAccountFields) {
    this.isInitialized = fields.isInitialized;
    this.providersWallet = fields.providersWallet;
    this.lastDepositEpoch = fields.lastDepositEpoch;
    this.lastWithdrawFeeEpoch = fields.lastWithdrawFeeEpoch;
    this.providerDepositedAmount = fields.providerDepositedAmount;
    this.solEarned = fields.solEarned;
    this.lastKnownCumulativeFeeRate = fields.lastKnownCumulativeFeeRate;
    this.lastKnownPnlRate = fields.lastKnownPnlRate;
    this.isActive = fields.isActive;
    this.withdrawalRequestAmount = fields.withdrawalRequestAmount;
    this.withdrawalRequestEpoch = fields.withdrawalRequestEpoch;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<LiquidityProviderAccount | null> {
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
  ): Promise<Array<LiquidityProviderAccount | null>> {
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

  static decode(data: Buffer): LiquidityProviderAccount {
    if (!data.slice(0, 8).equals(LiquidityProviderAccount.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = LiquidityProviderAccount.layout.decode(data.slice(8));

    return new LiquidityProviderAccount({
      isInitialized: dec.isInitialized,
      providersWallet: dec.providersWallet,
      lastDepositEpoch: dec.lastDepositEpoch,
      lastWithdrawFeeEpoch: dec.lastWithdrawFeeEpoch,
      providerDepositedAmount: dec.providerDepositedAmount,
      solEarned: dec.solEarned,
      lastKnownCumulativeFeeRate: dec.lastKnownCumulativeFeeRate,
      lastKnownPnlRate: dec.lastKnownPnlRate,
      isActive: dec.isActive,
      withdrawalRequestAmount: dec.withdrawalRequestAmount,
      withdrawalRequestEpoch: dec.withdrawalRequestEpoch,
    });
  }

  toJSON(): LiquidityProviderAccountJSON {
    return {
      isInitialized: this.isInitialized,
      providersWallet: this.providersWallet.toString(),
      lastDepositEpoch: this.lastDepositEpoch.toString(),
      lastWithdrawFeeEpoch: this.lastWithdrawFeeEpoch.toString(),
      providerDepositedAmount: this.providerDepositedAmount.toString(),
      solEarned: this.solEarned.toString(),
      lastKnownCumulativeFeeRate: this.lastKnownCumulativeFeeRate.toString(),
      lastKnownPnlRate: this.lastKnownPnlRate.toString(),
      isActive: this.isActive,
      withdrawalRequestAmount: this.withdrawalRequestAmount.toString(),
      withdrawalRequestEpoch: this.withdrawalRequestEpoch.toString(),
    };
  }

  static fromJSON(obj: LiquidityProviderAccountJSON): LiquidityProviderAccount {
    return new LiquidityProviderAccount({
      isInitialized: obj.isInitialized,
      providersWallet: new PublicKey(obj.providersWallet),
      lastDepositEpoch: new BN(obj.lastDepositEpoch),
      lastWithdrawFeeEpoch: new BN(obj.lastWithdrawFeeEpoch),
      providerDepositedAmount: new BN(obj.providerDepositedAmount),
      solEarned: new BN(obj.solEarned),
      lastKnownCumulativeFeeRate: new BN(obj.lastKnownCumulativeFeeRate),
      lastKnownPnlRate: new BN(obj.lastKnownPnlRate),
      isActive: obj.isActive,
      withdrawalRequestAmount: new BN(obj.withdrawalRequestAmount),
      withdrawalRequestEpoch: new BN(obj.withdrawalRequestEpoch),
    });
  }
}
