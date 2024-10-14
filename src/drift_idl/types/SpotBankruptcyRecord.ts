import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface SpotBankruptcyRecordFields {
  marketIndex: number;
  borrowAmount: BN;
  ifPayment: BN;
  cumulativeDepositInterestDelta: BN;
}

export interface SpotBankruptcyRecordJSON {
  marketIndex: number;
  borrowAmount: string;
  ifPayment: string;
  cumulativeDepositInterestDelta: string;
}

export class SpotBankruptcyRecord {
  readonly marketIndex: number;
  readonly borrowAmount: BN;
  readonly ifPayment: BN;
  readonly cumulativeDepositInterestDelta: BN;

  constructor(fields: SpotBankruptcyRecordFields) {
    this.marketIndex = fields.marketIndex;
    this.borrowAmount = fields.borrowAmount;
    this.ifPayment = fields.ifPayment;
    this.cumulativeDepositInterestDelta = fields.cumulativeDepositInterestDelta;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u16("marketIndex"),
        borsh.u128("borrowAmount"),
        borsh.u128("ifPayment"),
        borsh.u128("cumulativeDepositInterestDelta"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new SpotBankruptcyRecord({
      marketIndex: obj.marketIndex,
      borrowAmount: obj.borrowAmount,
      ifPayment: obj.ifPayment,
      cumulativeDepositInterestDelta: obj.cumulativeDepositInterestDelta,
    });
  }

  static toEncodable(fields: SpotBankruptcyRecordFields) {
    return {
      marketIndex: fields.marketIndex,
      borrowAmount: fields.borrowAmount,
      ifPayment: fields.ifPayment,
      cumulativeDepositInterestDelta: fields.cumulativeDepositInterestDelta,
    };
  }

  toJSON(): SpotBankruptcyRecordJSON {
    return {
      marketIndex: this.marketIndex,
      borrowAmount: this.borrowAmount.toString(),
      ifPayment: this.ifPayment.toString(),
      cumulativeDepositInterestDelta:
        this.cumulativeDepositInterestDelta.toString(),
    };
  }

  static fromJSON(obj: SpotBankruptcyRecordJSON): SpotBankruptcyRecord {
    return new SpotBankruptcyRecord({
      marketIndex: obj.marketIndex,
      borrowAmount: new BN(obj.borrowAmount),
      ifPayment: new BN(obj.ifPayment),
      cumulativeDepositInterestDelta: new BN(
        obj.cumulativeDepositInterestDelta
      ),
    });
  }

  toEncodable() {
    return SpotBankruptcyRecord.toEncodable(this);
  }
}
