import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface VaultDepositorFields {
  vault: PublicKey;
  pubkey: PublicKey;
  authority: PublicKey;
  vaultShares: BN;
  lastWithdrawRequest: types.WithdrawRequestFields;
  lastValidTs: BN;
  netDeposits: BN;
  totalDeposits: BN;
  totalWithdraws: BN;
  cumulativeProfitShareAmount: BN;
  profitShareFeePaid: BN;
  vaultSharesBase: number;
  padding1: number;
  padding: Array<BN>;
}

export interface VaultDepositorJSON {
  vault: string;
  pubkey: string;
  authority: string;
  vaultShares: string;
  lastWithdrawRequest: types.WithdrawRequestJSON;
  lastValidTs: string;
  netDeposits: string;
  totalDeposits: string;
  totalWithdraws: string;
  cumulativeProfitShareAmount: string;
  profitShareFeePaid: string;
  vaultSharesBase: number;
  padding1: number;
  padding: Array<string>;
}

export class VaultDepositor {
  readonly vault: PublicKey;
  readonly pubkey: PublicKey;
  readonly authority: PublicKey;
  readonly vaultShares: BN;
  readonly lastWithdrawRequest: types.WithdrawRequest;
  readonly lastValidTs: BN;
  readonly netDeposits: BN;
  readonly totalDeposits: BN;
  readonly totalWithdraws: BN;
  readonly cumulativeProfitShareAmount: BN;
  readonly profitShareFeePaid: BN;
  readonly vaultSharesBase: number;
  readonly padding1: number;
  readonly padding: Array<BN>;

  static readonly discriminator = Buffer.from([
    87, 109, 182, 106, 87, 96, 63, 211,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("vault"),
    borsh.publicKey("pubkey"),
    borsh.publicKey("authority"),
    borsh.u128("vaultShares"),
    types.WithdrawRequest.layout("lastWithdrawRequest"),
    borsh.i64("lastValidTs"),
    borsh.i64("netDeposits"),
    borsh.u64("totalDeposits"),
    borsh.u64("totalWithdraws"),
    borsh.i64("cumulativeProfitShareAmount"),
    borsh.u64("profitShareFeePaid"),
    borsh.u32("vaultSharesBase"),
    borsh.u32("padding1"),
    borsh.array(borsh.u64(), 8, "padding"),
  ]);

  constructor(fields: VaultDepositorFields) {
    this.vault = fields.vault;
    this.pubkey = fields.pubkey;
    this.authority = fields.authority;
    this.vaultShares = fields.vaultShares;
    this.lastWithdrawRequest = new types.WithdrawRequest({
      ...fields.lastWithdrawRequest,
    });
    this.lastValidTs = fields.lastValidTs;
    this.netDeposits = fields.netDeposits;
    this.totalDeposits = fields.totalDeposits;
    this.totalWithdraws = fields.totalWithdraws;
    this.cumulativeProfitShareAmount = fields.cumulativeProfitShareAmount;
    this.profitShareFeePaid = fields.profitShareFeePaid;
    this.vaultSharesBase = fields.vaultSharesBase;
    this.padding1 = fields.padding1;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<VaultDepositor | null> {
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
  ): Promise<Array<VaultDepositor | null>> {
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

  static decode(data: Buffer): VaultDepositor {
    if (!data.slice(0, 8).equals(VaultDepositor.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = VaultDepositor.layout.decode(data.slice(8));

    return new VaultDepositor({
      vault: dec.vault,
      pubkey: dec.pubkey,
      authority: dec.authority,
      vaultShares: dec.vaultShares,
      lastWithdrawRequest: types.WithdrawRequest.fromDecoded(
        dec.lastWithdrawRequest
      ),
      lastValidTs: dec.lastValidTs,
      netDeposits: dec.netDeposits,
      totalDeposits: dec.totalDeposits,
      totalWithdraws: dec.totalWithdraws,
      cumulativeProfitShareAmount: dec.cumulativeProfitShareAmount,
      profitShareFeePaid: dec.profitShareFeePaid,
      vaultSharesBase: dec.vaultSharesBase,
      padding1: dec.padding1,
      padding: dec.padding,
    });
  }

  toJSON(): VaultDepositorJSON {
    return {
      vault: this.vault.toString(),
      pubkey: this.pubkey.toString(),
      authority: this.authority.toString(),
      vaultShares: this.vaultShares.toString(),
      lastWithdrawRequest: this.lastWithdrawRequest.toJSON(),
      lastValidTs: this.lastValidTs.toString(),
      netDeposits: this.netDeposits.toString(),
      totalDeposits: this.totalDeposits.toString(),
      totalWithdraws: this.totalWithdraws.toString(),
      cumulativeProfitShareAmount: this.cumulativeProfitShareAmount.toString(),
      profitShareFeePaid: this.profitShareFeePaid.toString(),
      vaultSharesBase: this.vaultSharesBase,
      padding1: this.padding1,
      padding: this.padding.map((item) => item.toString()),
    };
  }

  static fromJSON(obj: VaultDepositorJSON): VaultDepositor {
    return new VaultDepositor({
      vault: new PublicKey(obj.vault),
      pubkey: new PublicKey(obj.pubkey),
      authority: new PublicKey(obj.authority),
      vaultShares: new BN(obj.vaultShares),
      lastWithdrawRequest: types.WithdrawRequest.fromJSON(
        obj.lastWithdrawRequest
      ),
      lastValidTs: new BN(obj.lastValidTs),
      netDeposits: new BN(obj.netDeposits),
      totalDeposits: new BN(obj.totalDeposits),
      totalWithdraws: new BN(obj.totalWithdraws),
      cumulativeProfitShareAmount: new BN(obj.cumulativeProfitShareAmount),
      profitShareFeePaid: new BN(obj.profitShareFeePaid),
      vaultSharesBase: obj.vaultSharesBase,
      padding1: obj.padding1,
      padding: obj.padding.map((item) => new BN(item)),
    });
  }
}
