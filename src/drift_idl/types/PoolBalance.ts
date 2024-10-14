import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface PoolBalanceFields {
  /**
   * To get the pool's token amount, you must multiply the scaled balance by the market's cumulative
   * deposit interest
   * precision: SPOT_BALANCE_PRECISION
   */
  scaledBalance: BN;
  /** The spot market the pool is for */
  marketIndex: number;
  padding: Array<number>;
}

export interface PoolBalanceJSON {
  /**
   * To get the pool's token amount, you must multiply the scaled balance by the market's cumulative
   * deposit interest
   * precision: SPOT_BALANCE_PRECISION
   */
  scaledBalance: string;
  /** The spot market the pool is for */
  marketIndex: number;
  padding: Array<number>;
}

export class PoolBalance {
  /**
   * To get the pool's token amount, you must multiply the scaled balance by the market's cumulative
   * deposit interest
   * precision: SPOT_BALANCE_PRECISION
   */
  readonly scaledBalance: BN;
  /** The spot market the pool is for */
  readonly marketIndex: number;
  readonly padding: Array<number>;

  constructor(fields: PoolBalanceFields) {
    this.scaledBalance = fields.scaledBalance;
    this.marketIndex = fields.marketIndex;
    this.padding = fields.padding;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u128("scaledBalance"),
        borsh.u16("marketIndex"),
        borsh.array(borsh.u8(), 6, "padding"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new PoolBalance({
      scaledBalance: obj.scaledBalance,
      marketIndex: obj.marketIndex,
      padding: obj.padding,
    });
  }

  static toEncodable(fields: PoolBalanceFields) {
    return {
      scaledBalance: fields.scaledBalance,
      marketIndex: fields.marketIndex,
      padding: fields.padding,
    };
  }

  toJSON(): PoolBalanceJSON {
    return {
      scaledBalance: this.scaledBalance.toString(),
      marketIndex: this.marketIndex,
      padding: this.padding,
    };
  }

  static fromJSON(obj: PoolBalanceJSON): PoolBalance {
    return new PoolBalance({
      scaledBalance: new BN(obj.scaledBalance),
      marketIndex: obj.marketIndex,
      padding: obj.padding,
    });
  }

  toEncodable() {
    return PoolBalance.toEncodable(this);
  }
}
