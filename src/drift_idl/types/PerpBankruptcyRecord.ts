import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface PerpBankruptcyRecordFields {
  marketIndex: number;
  pnl: BN;
  ifPayment: BN;
  clawbackUser: PublicKey | null;
  clawbackUserPayment: BN | null;
  cumulativeFundingRateDelta: BN;
}

export interface PerpBankruptcyRecordJSON {
  marketIndex: number;
  pnl: string;
  ifPayment: string;
  clawbackUser: string | null;
  clawbackUserPayment: string | null;
  cumulativeFundingRateDelta: string;
}

export class PerpBankruptcyRecord {
  readonly marketIndex: number;
  readonly pnl: BN;
  readonly ifPayment: BN;
  readonly clawbackUser: PublicKey | null;
  readonly clawbackUserPayment: BN | null;
  readonly cumulativeFundingRateDelta: BN;

  constructor(fields: PerpBankruptcyRecordFields) {
    this.marketIndex = fields.marketIndex;
    this.pnl = fields.pnl;
    this.ifPayment = fields.ifPayment;
    this.clawbackUser = fields.clawbackUser;
    this.clawbackUserPayment = fields.clawbackUserPayment;
    this.cumulativeFundingRateDelta = fields.cumulativeFundingRateDelta;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u16("marketIndex"),
        borsh.i128("pnl"),
        borsh.u128("ifPayment"),
        borsh.option(borsh.publicKey(), "clawbackUser"),
        borsh.option(borsh.u128(), "clawbackUserPayment"),
        borsh.i128("cumulativeFundingRateDelta"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new PerpBankruptcyRecord({
      marketIndex: obj.marketIndex,
      pnl: obj.pnl,
      ifPayment: obj.ifPayment,
      clawbackUser: obj.clawbackUser,
      clawbackUserPayment: obj.clawbackUserPayment,
      cumulativeFundingRateDelta: obj.cumulativeFundingRateDelta,
    });
  }

  static toEncodable(fields: PerpBankruptcyRecordFields) {
    return {
      marketIndex: fields.marketIndex,
      pnl: fields.pnl,
      ifPayment: fields.ifPayment,
      clawbackUser: fields.clawbackUser,
      clawbackUserPayment: fields.clawbackUserPayment,
      cumulativeFundingRateDelta: fields.cumulativeFundingRateDelta,
    };
  }

  toJSON(): PerpBankruptcyRecordJSON {
    return {
      marketIndex: this.marketIndex,
      pnl: this.pnl.toString(),
      ifPayment: this.ifPayment.toString(),
      clawbackUser: (this.clawbackUser && this.clawbackUser.toString()) || null,
      clawbackUserPayment:
        (this.clawbackUserPayment && this.clawbackUserPayment.toString()) ||
        null,
      cumulativeFundingRateDelta: this.cumulativeFundingRateDelta.toString(),
    };
  }

  static fromJSON(obj: PerpBankruptcyRecordJSON): PerpBankruptcyRecord {
    return new PerpBankruptcyRecord({
      marketIndex: obj.marketIndex,
      pnl: new BN(obj.pnl),
      ifPayment: new BN(obj.ifPayment),
      clawbackUser:
        (obj.clawbackUser && new PublicKey(obj.clawbackUser)) || null,
      clawbackUserPayment:
        (obj.clawbackUserPayment && new BN(obj.clawbackUserPayment)) || null,
      cumulativeFundingRateDelta: new BN(obj.cumulativeFundingRateDelta),
    });
  }

  toEncodable() {
    return PerpBankruptcyRecord.toEncodable(this);
  }
}
