import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InsuranceFundStakeFields {
  authority: PublicKey;
  ifShares: BN;
  lastWithdrawRequestShares: BN;
  ifBase: BN;
  lastValidTs: BN;
  lastWithdrawRequestValue: BN;
  lastWithdrawRequestTs: BN;
  costBasis: BN;
  marketIndex: number;
  padding: Array<number>;
}

export interface InsuranceFundStakeJSON {
  authority: string;
  ifShares: string;
  lastWithdrawRequestShares: string;
  ifBase: string;
  lastValidTs: string;
  lastWithdrawRequestValue: string;
  lastWithdrawRequestTs: string;
  costBasis: string;
  marketIndex: number;
  padding: Array<number>;
}

export class InsuranceFundStake {
  readonly authority: PublicKey;
  readonly ifShares: BN;
  readonly lastWithdrawRequestShares: BN;
  readonly ifBase: BN;
  readonly lastValidTs: BN;
  readonly lastWithdrawRequestValue: BN;
  readonly lastWithdrawRequestTs: BN;
  readonly costBasis: BN;
  readonly marketIndex: number;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    110, 202, 14, 42, 95, 73, 90, 95,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("authority"),
    borsh.u128("ifShares"),
    borsh.u128("lastWithdrawRequestShares"),
    borsh.u128("ifBase"),
    borsh.i64("lastValidTs"),
    borsh.u64("lastWithdrawRequestValue"),
    borsh.i64("lastWithdrawRequestTs"),
    borsh.i64("costBasis"),
    borsh.u16("marketIndex"),
    borsh.array(borsh.u8(), 14, "padding"),
  ]);

  constructor(fields: InsuranceFundStakeFields) {
    this.authority = fields.authority;
    this.ifShares = fields.ifShares;
    this.lastWithdrawRequestShares = fields.lastWithdrawRequestShares;
    this.ifBase = fields.ifBase;
    this.lastValidTs = fields.lastValidTs;
    this.lastWithdrawRequestValue = fields.lastWithdrawRequestValue;
    this.lastWithdrawRequestTs = fields.lastWithdrawRequestTs;
    this.costBasis = fields.costBasis;
    this.marketIndex = fields.marketIndex;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<InsuranceFundStake | null> {
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
  ): Promise<Array<InsuranceFundStake | null>> {
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

  static decode(data: Buffer): InsuranceFundStake {
    if (!data.slice(0, 8).equals(InsuranceFundStake.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = InsuranceFundStake.layout.decode(data.slice(8));

    return new InsuranceFundStake({
      authority: dec.authority,
      ifShares: dec.ifShares,
      lastWithdrawRequestShares: dec.lastWithdrawRequestShares,
      ifBase: dec.ifBase,
      lastValidTs: dec.lastValidTs,
      lastWithdrawRequestValue: dec.lastWithdrawRequestValue,
      lastWithdrawRequestTs: dec.lastWithdrawRequestTs,
      costBasis: dec.costBasis,
      marketIndex: dec.marketIndex,
      padding: dec.padding,
    });
  }

  toJSON(): InsuranceFundStakeJSON {
    return {
      authority: this.authority.toString(),
      ifShares: this.ifShares.toString(),
      lastWithdrawRequestShares: this.lastWithdrawRequestShares.toString(),
      ifBase: this.ifBase.toString(),
      lastValidTs: this.lastValidTs.toString(),
      lastWithdrawRequestValue: this.lastWithdrawRequestValue.toString(),
      lastWithdrawRequestTs: this.lastWithdrawRequestTs.toString(),
      costBasis: this.costBasis.toString(),
      marketIndex: this.marketIndex,
      padding: this.padding,
    };
  }

  static fromJSON(obj: InsuranceFundStakeJSON): InsuranceFundStake {
    return new InsuranceFundStake({
      authority: new PublicKey(obj.authority),
      ifShares: new BN(obj.ifShares),
      lastWithdrawRequestShares: new BN(obj.lastWithdrawRequestShares),
      ifBase: new BN(obj.ifBase),
      lastValidTs: new BN(obj.lastValidTs),
      lastWithdrawRequestValue: new BN(obj.lastWithdrawRequestValue),
      lastWithdrawRequestTs: new BN(obj.lastWithdrawRequestTs),
      costBasis: new BN(obj.costBasis),
      marketIndex: obj.marketIndex,
      padding: obj.padding,
    });
  }
}
