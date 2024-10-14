import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface WithdrawRequestFields {
  shares: BN;
  value: BN;
  ts: BN;
}

export interface WithdrawRequestJSON {
  shares: string;
  value: string;
  ts: string;
}

export class WithdrawRequest {
  readonly shares: BN;
  readonly value: BN;
  readonly ts: BN;

  constructor(fields: WithdrawRequestFields) {
    this.shares = fields.shares;
    this.value = fields.value;
    this.ts = fields.ts;
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u128("shares"), borsh.u64("value"), borsh.i64("ts")],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new WithdrawRequest({
      shares: obj.shares,
      value: obj.value,
      ts: obj.ts,
    });
  }

  static toEncodable(fields: WithdrawRequestFields) {
    return {
      shares: fields.shares,
      value: fields.value,
      ts: fields.ts,
    };
  }

  toJSON(): WithdrawRequestJSON {
    return {
      shares: this.shares.toString(),
      value: this.value.toString(),
      ts: this.ts.toString(),
    };
  }

  static fromJSON(obj: WithdrawRequestJSON): WithdrawRequest {
    return new WithdrawRequest({
      shares: new BN(obj.shares),
      value: new BN(obj.value),
      ts: new BN(obj.ts),
    });
  }

  toEncodable() {
    return WithdrawRequest.toEncodable(this);
  }
}
