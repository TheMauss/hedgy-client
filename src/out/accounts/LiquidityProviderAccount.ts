import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface LiquidityProviderAccountFields {
  isInitialized: boolean;
  providersWallet: PublicKey;
  withdrawalRequestAmount: BN;
  withdrawalRequestEpoch: BN;
  usdcWithdrawalRequestAmount: BN;
  usdcWithdrawalRequestEpoch: BN;
}

export interface LiquidityProviderAccountJSON {
  isInitialized: boolean;
  providersWallet: string;
  withdrawalRequestAmount: string;
  withdrawalRequestEpoch: string;
  usdcWithdrawalRequestAmount: string;
  usdcWithdrawalRequestEpoch: string;
}

export class LiquidityProviderAccount {
  readonly isInitialized: boolean;
  readonly providersWallet: PublicKey;
  readonly withdrawalRequestAmount: BN;
  readonly withdrawalRequestEpoch: BN;
  readonly usdcWithdrawalRequestAmount: BN;
  readonly usdcWithdrawalRequestEpoch: BN;

  static readonly discriminator = Buffer.from([
    37, 78, 108, 229, 124, 38, 135, 141,
  ]);

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.publicKey("providersWallet"),
    borsh.u64("withdrawalRequestAmount"),
    borsh.u64("withdrawalRequestEpoch"),
    borsh.u64("usdcWithdrawalRequestAmount"),
    borsh.u64("usdcWithdrawalRequestEpoch"),
  ]);

  constructor(fields: LiquidityProviderAccountFields) {
    this.isInitialized = fields.isInitialized;
    this.providersWallet = fields.providersWallet;
    this.withdrawalRequestAmount = fields.withdrawalRequestAmount;
    this.withdrawalRequestEpoch = fields.withdrawalRequestEpoch;
    this.usdcWithdrawalRequestAmount = fields.usdcWithdrawalRequestAmount;
    this.usdcWithdrawalRequestEpoch = fields.usdcWithdrawalRequestEpoch;
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
      withdrawalRequestAmount: dec.withdrawalRequestAmount,
      withdrawalRequestEpoch: dec.withdrawalRequestEpoch,
      usdcWithdrawalRequestAmount: dec.usdcWithdrawalRequestAmount,
      usdcWithdrawalRequestEpoch: dec.usdcWithdrawalRequestEpoch,
    });
  }

  toJSON(): LiquidityProviderAccountJSON {
    return {
      isInitialized: this.isInitialized,
      providersWallet: this.providersWallet.toString(),
      withdrawalRequestAmount: this.withdrawalRequestAmount.toString(),
      withdrawalRequestEpoch: this.withdrawalRequestEpoch.toString(),
      usdcWithdrawalRequestAmount: this.usdcWithdrawalRequestAmount.toString(),
      usdcWithdrawalRequestEpoch: this.usdcWithdrawalRequestEpoch.toString(),
    };
  }

  static fromJSON(obj: LiquidityProviderAccountJSON): LiquidityProviderAccount {
    return new LiquidityProviderAccount({
      isInitialized: obj.isInitialized,
      providersWallet: new PublicKey(obj.providersWallet),
      withdrawalRequestAmount: new BN(obj.withdrawalRequestAmount),
      withdrawalRequestEpoch: new BN(obj.withdrawalRequestEpoch),
      usdcWithdrawalRequestAmount: new BN(obj.usdcWithdrawalRequestAmount),
      usdcWithdrawalRequestEpoch: new BN(obj.usdcWithdrawalRequestEpoch),
    });
  }
}
