import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface VaultFields {
  name: Array<number>;
  pubkey: PublicKey;
  manager: PublicKey;
  tokenAccount: PublicKey;
  userStats: PublicKey;
  user: PublicKey;
  delegate: PublicKey;
  liquidationDelegate: PublicKey;
  userShares: BN;
  totalShares: BN;
  lastFeeUpdateTs: BN;
  liquidationStartTs: BN;
  redeemPeriod: BN;
  totalWithdrawRequested: BN;
  maxTokens: BN;
  managementFee: BN;
  initTs: BN;
  netDeposits: BN;
  managerNetDeposits: BN;
  totalDeposits: BN;
  totalWithdraws: BN;
  managerTotalDeposits: BN;
  managerTotalWithdraws: BN;
  managerTotalFee: BN;
  managerTotalProfitShare: BN;
  minDepositAmount: BN;
  lastManagerWithdrawRequest: types.WithdrawRequestFields;
  sharesBase: number;
  profitShare: number;
  hurdleRate: number;
  spotMarketIndex: number;
  bump: number;
  permissioned: boolean;
  vaultProtocol: boolean;
  padding1: Array<number>;
  padding: Array<BN>;
}

export interface VaultJSON {
  name: Array<number>;
  pubkey: string;
  manager: string;
  tokenAccount: string;
  userStats: string;
  user: string;
  delegate: string;
  liquidationDelegate: string;
  userShares: string;
  totalShares: string;
  lastFeeUpdateTs: string;
  liquidationStartTs: string;
  redeemPeriod: string;
  totalWithdrawRequested: string;
  maxTokens: string;
  managementFee: string;
  initTs: string;
  netDeposits: string;
  managerNetDeposits: string;
  totalDeposits: string;
  totalWithdraws: string;
  managerTotalDeposits: string;
  managerTotalWithdraws: string;
  managerTotalFee: string;
  managerTotalProfitShare: string;
  minDepositAmount: string;
  lastManagerWithdrawRequest: types.WithdrawRequestJSON;
  sharesBase: number;
  profitShare: number;
  hurdleRate: number;
  spotMarketIndex: number;
  bump: number;
  permissioned: boolean;
  vaultProtocol: boolean;
  padding1: Array<number>;
  padding: Array<string>;
}

export class Vault {
  readonly name: Array<number>;
  readonly pubkey: PublicKey;
  readonly manager: PublicKey;
  readonly tokenAccount: PublicKey;
  readonly userStats: PublicKey;
  readonly user: PublicKey;
  readonly delegate: PublicKey;
  readonly liquidationDelegate: PublicKey;
  readonly userShares: BN;
  readonly totalShares: BN;
  readonly lastFeeUpdateTs: BN;
  readonly liquidationStartTs: BN;
  readonly redeemPeriod: BN;
  readonly totalWithdrawRequested: BN;
  readonly maxTokens: BN;
  readonly managementFee: BN;
  readonly initTs: BN;
  readonly netDeposits: BN;
  readonly managerNetDeposits: BN;
  readonly totalDeposits: BN;
  readonly totalWithdraws: BN;
  readonly managerTotalDeposits: BN;
  readonly managerTotalWithdraws: BN;
  readonly managerTotalFee: BN;
  readonly managerTotalProfitShare: BN;
  readonly minDepositAmount: BN;
  readonly lastManagerWithdrawRequest: types.WithdrawRequest;
  readonly sharesBase: number;
  readonly profitShare: number;
  readonly hurdleRate: number;
  readonly spotMarketIndex: number;
  readonly bump: number;
  readonly permissioned: boolean;
  readonly vaultProtocol: boolean;
  readonly padding1: Array<number>;
  readonly padding: Array<BN>;

  static readonly discriminator = Buffer.from([
    211, 8, 232, 43, 2, 152, 117, 119,
  ]);

  static readonly layout = borsh.struct([
    borsh.array(borsh.u8(), 32, "name"),
    borsh.publicKey("pubkey"),
    borsh.publicKey("manager"),
    borsh.publicKey("tokenAccount"),
    borsh.publicKey("userStats"),
    borsh.publicKey("user"),
    borsh.publicKey("delegate"),
    borsh.publicKey("liquidationDelegate"),
    borsh.u128("userShares"),
    borsh.u128("totalShares"),
    borsh.i64("lastFeeUpdateTs"),
    borsh.i64("liquidationStartTs"),
    borsh.i64("redeemPeriod"),
    borsh.u64("totalWithdrawRequested"),
    borsh.u64("maxTokens"),
    borsh.i64("managementFee"),
    borsh.i64("initTs"),
    borsh.i64("netDeposits"),
    borsh.i64("managerNetDeposits"),
    borsh.u64("totalDeposits"),
    borsh.u64("totalWithdraws"),
    borsh.u64("managerTotalDeposits"),
    borsh.u64("managerTotalWithdraws"),
    borsh.i64("managerTotalFee"),
    borsh.u64("managerTotalProfitShare"),
    borsh.u64("minDepositAmount"),
    types.WithdrawRequest.layout("lastManagerWithdrawRequest"),
    borsh.u32("sharesBase"),
    borsh.u32("profitShare"),
    borsh.u32("hurdleRate"),
    borsh.u16("spotMarketIndex"),
    borsh.u8("bump"),
    borsh.bool("permissioned"),
    borsh.bool("vaultProtocol"),
    borsh.array(borsh.u8(), 7, "padding1"),
    borsh.array(borsh.u64(), 7, "padding"),
  ]);

  constructor(fields: VaultFields) {
    this.name = fields.name;
    this.pubkey = fields.pubkey;
    this.manager = fields.manager;
    this.tokenAccount = fields.tokenAccount;
    this.userStats = fields.userStats;
    this.user = fields.user;
    this.delegate = fields.delegate;
    this.liquidationDelegate = fields.liquidationDelegate;
    this.userShares = fields.userShares;
    this.totalShares = fields.totalShares;
    this.lastFeeUpdateTs = fields.lastFeeUpdateTs;
    this.liquidationStartTs = fields.liquidationStartTs;
    this.redeemPeriod = fields.redeemPeriod;
    this.totalWithdrawRequested = fields.totalWithdrawRequested;
    this.maxTokens = fields.maxTokens;
    this.managementFee = fields.managementFee;
    this.initTs = fields.initTs;
    this.netDeposits = fields.netDeposits;
    this.managerNetDeposits = fields.managerNetDeposits;
    this.totalDeposits = fields.totalDeposits;
    this.totalWithdraws = fields.totalWithdraws;
    this.managerTotalDeposits = fields.managerTotalDeposits;
    this.managerTotalWithdraws = fields.managerTotalWithdraws;
    this.managerTotalFee = fields.managerTotalFee;
    this.managerTotalProfitShare = fields.managerTotalProfitShare;
    this.minDepositAmount = fields.minDepositAmount;
    this.lastManagerWithdrawRequest = new types.WithdrawRequest({
      ...fields.lastManagerWithdrawRequest,
    });
    this.sharesBase = fields.sharesBase;
    this.profitShare = fields.profitShare;
    this.hurdleRate = fields.hurdleRate;
    this.spotMarketIndex = fields.spotMarketIndex;
    this.bump = fields.bump;
    this.permissioned = fields.permissioned;
    this.vaultProtocol = fields.vaultProtocol;
    this.padding1 = fields.padding1;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<Vault | null> {
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
  ): Promise<Array<Vault | null>> {
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

  static decode(data: Buffer): Vault {
    if (!data.slice(0, 8).equals(Vault.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = Vault.layout.decode(data.slice(8));

    return new Vault({
      name: dec.name,
      pubkey: dec.pubkey,
      manager: dec.manager,
      tokenAccount: dec.tokenAccount,
      userStats: dec.userStats,
      user: dec.user,
      delegate: dec.delegate,
      liquidationDelegate: dec.liquidationDelegate,
      userShares: dec.userShares,
      totalShares: dec.totalShares,
      lastFeeUpdateTs: dec.lastFeeUpdateTs,
      liquidationStartTs: dec.liquidationStartTs,
      redeemPeriod: dec.redeemPeriod,
      totalWithdrawRequested: dec.totalWithdrawRequested,
      maxTokens: dec.maxTokens,
      managementFee: dec.managementFee,
      initTs: dec.initTs,
      netDeposits: dec.netDeposits,
      managerNetDeposits: dec.managerNetDeposits,
      totalDeposits: dec.totalDeposits,
      totalWithdraws: dec.totalWithdraws,
      managerTotalDeposits: dec.managerTotalDeposits,
      managerTotalWithdraws: dec.managerTotalWithdraws,
      managerTotalFee: dec.managerTotalFee,
      managerTotalProfitShare: dec.managerTotalProfitShare,
      minDepositAmount: dec.minDepositAmount,
      lastManagerWithdrawRequest: types.WithdrawRequest.fromDecoded(
        dec.lastManagerWithdrawRequest
      ),
      sharesBase: dec.sharesBase,
      profitShare: dec.profitShare,
      hurdleRate: dec.hurdleRate,
      spotMarketIndex: dec.spotMarketIndex,
      bump: dec.bump,
      permissioned: dec.permissioned,
      vaultProtocol: dec.vaultProtocol,
      padding1: dec.padding1,
      padding: dec.padding,
    });
  }

  toJSON(): VaultJSON {
    return {
      name: this.name,
      pubkey: this.pubkey.toString(),
      manager: this.manager.toString(),
      tokenAccount: this.tokenAccount.toString(),
      userStats: this.userStats.toString(),
      user: this.user.toString(),
      delegate: this.delegate.toString(),
      liquidationDelegate: this.liquidationDelegate.toString(),
      userShares: this.userShares.toString(),
      totalShares: this.totalShares.toString(),
      lastFeeUpdateTs: this.lastFeeUpdateTs.toString(),
      liquidationStartTs: this.liquidationStartTs.toString(),
      redeemPeriod: this.redeemPeriod.toString(),
      totalWithdrawRequested: this.totalWithdrawRequested.toString(),
      maxTokens: this.maxTokens.toString(),
      managementFee: this.managementFee.toString(),
      initTs: this.initTs.toString(),
      netDeposits: this.netDeposits.toString(),
      managerNetDeposits: this.managerNetDeposits.toString(),
      totalDeposits: this.totalDeposits.toString(),
      totalWithdraws: this.totalWithdraws.toString(),
      managerTotalDeposits: this.managerTotalDeposits.toString(),
      managerTotalWithdraws: this.managerTotalWithdraws.toString(),
      managerTotalFee: this.managerTotalFee.toString(),
      managerTotalProfitShare: this.managerTotalProfitShare.toString(),
      minDepositAmount: this.minDepositAmount.toString(),
      lastManagerWithdrawRequest: this.lastManagerWithdrawRequest.toJSON(),
      sharesBase: this.sharesBase,
      profitShare: this.profitShare,
      hurdleRate: this.hurdleRate,
      spotMarketIndex: this.spotMarketIndex,
      bump: this.bump,
      permissioned: this.permissioned,
      vaultProtocol: this.vaultProtocol,
      padding1: this.padding1,
      padding: this.padding.map((item) => item.toString()),
    };
  }

  static fromJSON(obj: VaultJSON): Vault {
    return new Vault({
      name: obj.name,
      pubkey: new PublicKey(obj.pubkey),
      manager: new PublicKey(obj.manager),
      tokenAccount: new PublicKey(obj.tokenAccount),
      userStats: new PublicKey(obj.userStats),
      user: new PublicKey(obj.user),
      delegate: new PublicKey(obj.delegate),
      liquidationDelegate: new PublicKey(obj.liquidationDelegate),
      userShares: new BN(obj.userShares),
      totalShares: new BN(obj.totalShares),
      lastFeeUpdateTs: new BN(obj.lastFeeUpdateTs),
      liquidationStartTs: new BN(obj.liquidationStartTs),
      redeemPeriod: new BN(obj.redeemPeriod),
      totalWithdrawRequested: new BN(obj.totalWithdrawRequested),
      maxTokens: new BN(obj.maxTokens),
      managementFee: new BN(obj.managementFee),
      initTs: new BN(obj.initTs),
      netDeposits: new BN(obj.netDeposits),
      managerNetDeposits: new BN(obj.managerNetDeposits),
      totalDeposits: new BN(obj.totalDeposits),
      totalWithdraws: new BN(obj.totalWithdraws),
      managerTotalDeposits: new BN(obj.managerTotalDeposits),
      managerTotalWithdraws: new BN(obj.managerTotalWithdraws),
      managerTotalFee: new BN(obj.managerTotalFee),
      managerTotalProfitShare: new BN(obj.managerTotalProfitShare),
      minDepositAmount: new BN(obj.minDepositAmount),
      lastManagerWithdrawRequest: types.WithdrawRequest.fromJSON(
        obj.lastManagerWithdrawRequest
      ),
      sharesBase: obj.sharesBase,
      profitShare: obj.profitShare,
      hurdleRate: obj.hurdleRate,
      spotMarketIndex: obj.spotMarketIndex,
      bump: obj.bump,
      permissioned: obj.permissioned,
      vaultProtocol: obj.vaultProtocol,
      padding1: obj.padding1,
      padding: obj.padding.map((item) => new BN(item)),
    });
  }
}
