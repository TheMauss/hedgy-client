import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface UpdatePerpMarketSummaryStatsParamsFields {
  quoteAssetAmountWithUnsettledLp: BN | null;
  netUnsettledFundingPnl: BN | null;
  updateAmmSummaryStats: boolean | null;
}

export interface UpdatePerpMarketSummaryStatsParamsJSON {
  quoteAssetAmountWithUnsettledLp: string | null;
  netUnsettledFundingPnl: string | null;
  updateAmmSummaryStats: boolean | null;
}

export class UpdatePerpMarketSummaryStatsParams {
  readonly quoteAssetAmountWithUnsettledLp: BN | null;
  readonly netUnsettledFundingPnl: BN | null;
  readonly updateAmmSummaryStats: boolean | null;

  constructor(fields: UpdatePerpMarketSummaryStatsParamsFields) {
    this.quoteAssetAmountWithUnsettledLp =
      fields.quoteAssetAmountWithUnsettledLp;
    this.netUnsettledFundingPnl = fields.netUnsettledFundingPnl;
    this.updateAmmSummaryStats = fields.updateAmmSummaryStats;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.option(borsh.i64(), "quoteAssetAmountWithUnsettledLp"),
        borsh.option(borsh.i64(), "netUnsettledFundingPnl"),
        borsh.option(borsh.bool(), "updateAmmSummaryStats"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new UpdatePerpMarketSummaryStatsParams({
      quoteAssetAmountWithUnsettledLp: obj.quoteAssetAmountWithUnsettledLp,
      netUnsettledFundingPnl: obj.netUnsettledFundingPnl,
      updateAmmSummaryStats: obj.updateAmmSummaryStats,
    });
  }

  static toEncodable(fields: UpdatePerpMarketSummaryStatsParamsFields) {
    return {
      quoteAssetAmountWithUnsettledLp: fields.quoteAssetAmountWithUnsettledLp,
      netUnsettledFundingPnl: fields.netUnsettledFundingPnl,
      updateAmmSummaryStats: fields.updateAmmSummaryStats,
    };
  }

  toJSON(): UpdatePerpMarketSummaryStatsParamsJSON {
    return {
      quoteAssetAmountWithUnsettledLp:
        (this.quoteAssetAmountWithUnsettledLp &&
          this.quoteAssetAmountWithUnsettledLp.toString()) ||
        null,
      netUnsettledFundingPnl:
        (this.netUnsettledFundingPnl &&
          this.netUnsettledFundingPnl.toString()) ||
        null,
      updateAmmSummaryStats: this.updateAmmSummaryStats,
    };
  }

  static fromJSON(
    obj: UpdatePerpMarketSummaryStatsParamsJSON
  ): UpdatePerpMarketSummaryStatsParams {
    return new UpdatePerpMarketSummaryStatsParams({
      quoteAssetAmountWithUnsettledLp:
        (obj.quoteAssetAmountWithUnsettledLp &&
          new BN(obj.quoteAssetAmountWithUnsettledLp)) ||
        null,
      netUnsettledFundingPnl:
        (obj.netUnsettledFundingPnl && new BN(obj.netUnsettledFundingPnl)) ||
        null,
      updateAmmSummaryStats: obj.updateAmmSummaryStats,
    });
  }

  toEncodable() {
    return UpdatePerpMarketSummaryStatsParams.toEncodable(this);
  }
}
