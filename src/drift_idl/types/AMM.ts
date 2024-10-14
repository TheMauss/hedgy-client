import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface AMMFields {
  /** oracle price data public key */
  oracle: PublicKey;
  /** stores historically witnessed oracle data */
  historicalOracleData: types.HistoricalOracleDataFields;
  /**
   * accumulated base asset amount since inception per lp share
   * precision: QUOTE_PRECISION
   */
  baseAssetAmountPerLp: BN;
  /**
   * accumulated quote asset amount since inception per lp share
   * precision: QUOTE_PRECISION
   */
  quoteAssetAmountPerLp: BN;
  /** partition of fees from perp market trading moved from pnl settlements */
  feePool: types.PoolBalanceFields;
  /**
   * `x` reserves for constant product mm formula (x * y = k)
   * precision: AMM_RESERVE_PRECISION
   */
  baseAssetReserve: BN;
  /**
   * `y` reserves for constant product mm formula (x * y = k)
   * precision: AMM_RESERVE_PRECISION
   */
  quoteAssetReserve: BN;
  /**
   * determines how close the min/max base asset reserve sit vs base reserves
   * allow for decreasing slippage without increasing liquidity and v.v.
   * precision: PERCENTAGE_PRECISION
   */
  concentrationCoef: BN;
  /**
   * minimum base_asset_reserve allowed before AMM is unavailable
   * precision: AMM_RESERVE_PRECISION
   */
  minBaseAssetReserve: BN;
  /**
   * maximum base_asset_reserve allowed before AMM is unavailable
   * precision: AMM_RESERVE_PRECISION
   */
  maxBaseAssetReserve: BN;
  /**
   * `sqrt(k)` in constant product mm formula (x * y = k). stored to avoid drift caused by integer math issues
   * precision: AMM_RESERVE_PRECISION
   */
  sqrtK: BN;
  /**
   * normalizing numerical factor for y, its use offers lowest slippage in cp-curve when market is balanced
   * precision: PEG_PRECISION
   */
  pegMultiplier: BN;
  /**
   * y when market is balanced. stored to save computation
   * precision: AMM_RESERVE_PRECISION
   */
  terminalQuoteAssetReserve: BN;
  /**
   * always non-negative. tracks number of total longs in market (regardless of counterparty)
   * precision: BASE_PRECISION
   */
  baseAssetAmountLong: BN;
  /**
   * always non-positive. tracks number of total shorts in market (regardless of counterparty)
   * precision: BASE_PRECISION
   */
  baseAssetAmountShort: BN;
  /**
   * tracks net position (longs-shorts) in market with AMM as counterparty
   * precision: BASE_PRECISION
   */
  baseAssetAmountWithAmm: BN;
  /**
   * tracks net position (longs-shorts) in market with LPs as counterparty
   * precision: BASE_PRECISION
   */
  baseAssetAmountWithUnsettledLp: BN;
  /**
   * max allowed open interest, blocks trades that breach this value
   * precision: BASE_PRECISION
   */
  maxOpenInterest: BN;
  /**
   * sum of all user's perp quote_asset_amount in market
   * precision: QUOTE_PRECISION
   */
  quoteAssetAmount: BN;
  /**
   * sum of all long user's quote_entry_amount in market
   * precision: QUOTE_PRECISION
   */
  quoteEntryAmountLong: BN;
  /**
   * sum of all short user's quote_entry_amount in market
   * precision: QUOTE_PRECISION
   */
  quoteEntryAmountShort: BN;
  /**
   * sum of all long user's quote_break_even_amount in market
   * precision: QUOTE_PRECISION
   */
  quoteBreakEvenAmountLong: BN;
  /**
   * sum of all short user's quote_break_even_amount in market
   * precision: QUOTE_PRECISION
   */
  quoteBreakEvenAmountShort: BN;
  /**
   * total user lp shares of sqrt_k (protocol owned liquidity = sqrt_k - last_funding_rate)
   * precision: AMM_RESERVE_PRECISION
   */
  userLpShares: BN;
  /**
   * last funding rate in this perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  lastFundingRate: BN;
  /**
   * last funding rate for longs in this perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  lastFundingRateLong: BN;
  /**
   * last funding rate for shorts in this perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  lastFundingRateShort: BN;
  /**
   * estimate of last 24h of funding rate perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  last24hAvgFundingRate: BN;
  /**
   * total fees collected by this perp market
   * precision: QUOTE_PRECISION
   */
  totalFee: BN;
  /**
   * total fees collected by the vAMM's bid/ask spread
   * precision: QUOTE_PRECISION
   */
  totalMmFee: BN;
  /**
   * total fees collected by exchange fee schedule
   * precision: QUOTE_PRECISION
   */
  totalExchangeFee: BN;
  /**
   * total fees minus any recognized upnl and pool withdraws
   * precision: QUOTE_PRECISION
   */
  totalFeeMinusDistributions: BN;
  /**
   * sum of all fees from fee pool withdrawn to revenue pool
   * precision: QUOTE_PRECISION
   */
  totalFeeWithdrawn: BN;
  /**
   * all fees collected by market for liquidations
   * precision: QUOTE_PRECISION
   */
  totalLiquidationFee: BN;
  /** accumulated funding rate for longs since inception in market */
  cumulativeFundingRateLong: BN;
  /** accumulated funding rate for shorts since inception in market */
  cumulativeFundingRateShort: BN;
  /** accumulated social loss paid by users since inception in market */
  totalSocialLoss: BN;
  /**
   * transformed base_asset_reserve for users going long
   * precision: AMM_RESERVE_PRECISION
   */
  askBaseAssetReserve: BN;
  /**
   * transformed quote_asset_reserve for users going long
   * precision: AMM_RESERVE_PRECISION
   */
  askQuoteAssetReserve: BN;
  /**
   * transformed base_asset_reserve for users going short
   * precision: AMM_RESERVE_PRECISION
   */
  bidBaseAssetReserve: BN;
  /**
   * transformed quote_asset_reserve for users going short
   * precision: AMM_RESERVE_PRECISION
   */
  bidQuoteAssetReserve: BN;
  /**
   * the last seen oracle price partially shrunk toward the amm reserve price
   * precision: PRICE_PRECISION
   */
  lastOracleNormalisedPrice: BN;
  /** the gap between the oracle price and the reserve price = y * peg_multiplier / x */
  lastOracleReservePriceSpreadPct: BN;
  /**
   * average estimate of bid price over funding_period
   * precision: PRICE_PRECISION
   */
  lastBidPriceTwap: BN;
  /**
   * average estimate of ask price over funding_period
   * precision: PRICE_PRECISION
   */
  lastAskPriceTwap: BN;
  /**
   * average estimate of (bid+ask)/2 price over funding_period
   * precision: PRICE_PRECISION
   */
  lastMarkPriceTwap: BN;
  /** average estimate of (bid+ask)/2 price over FIVE_MINUTES */
  lastMarkPriceTwap5min: BN;
  /** the last blockchain slot the amm was updated */
  lastUpdateSlot: BN;
  /**
   * the pct size of the oracle confidence interval
   * precision: PERCENTAGE_PRECISION
   */
  lastOracleConfPct: BN;
  /**
   * the total_fee_minus_distribution change since the last funding update
   * precision: QUOTE_PRECISION
   */
  netRevenueSinceLastFunding: BN;
  /** the last funding rate update unix_timestamp */
  lastFundingRateTs: BN;
  /** the peridocity of the funding rate updates */
  fundingPeriod: BN;
  /**
   * the base step size (increment) of orders
   * precision: BASE_PRECISION
   */
  orderStepSize: BN;
  /**
   * the price tick size of orders
   * precision: PRICE_PRECISION
   */
  orderTickSize: BN;
  /**
   * the minimum base size of an order
   * precision: BASE_PRECISION
   */
  minOrderSize: BN;
  /**
   * the max base size a single user can have
   * precision: BASE_PRECISION
   */
  maxPositionSize: BN;
  /**
   * estimated total of volume in market
   * QUOTE_PRECISION
   */
  volume24h: BN;
  /** the volume intensity of long fills against AMM */
  longIntensityVolume: BN;
  /** the volume intensity of short fills against AMM */
  shortIntensityVolume: BN;
  /** the blockchain unix timestamp at the time of the last trade */
  lastTradeTs: BN;
  /**
   * estimate of standard deviation of the fill (mark) prices
   * precision: PRICE_PRECISION
   */
  markStd: BN;
  /**
   * estimate of standard deviation of the oracle price at each update
   * precision: PRICE_PRECISION
   */
  oracleStd: BN;
  /** the last unix_timestamp the mark twap was updated */
  lastMarkPriceTwapTs: BN;
  /** the minimum spread the AMM can quote. also used as step size for some spread logic increases. */
  baseSpread: number;
  /** the maximum spread the AMM can quote */
  maxSpread: number;
  /** the spread for asks vs the reserve price */
  longSpread: number;
  /** the spread for bids vs the reserve price */
  shortSpread: number;
  /** the count intensity of long fills against AMM */
  longIntensityCount: number;
  /** the count intensity of short fills against AMM */
  shortIntensityCount: number;
  /** the fraction of total available liquidity a single fill on the AMM can consume */
  maxFillReserveFraction: number;
  /** the maximum slippage a single fill on the AMM can push */
  maxSlippageRatio: number;
  /** the update intensity of AMM formulaic updates (adjusting k). 0-100 */
  curveUpdateIntensity: number;
  /**
   * the jit intensity of AMM. larger intensity means larger participation in jit. 0 means no jit participation.
   * (0, 100] is intensity for protocol-owned AMM. (100, 200] is intensity for user LP-owned AMM.
   */
  ammJitIntensity: number;
  /** the oracle provider information. used to decode/scale the oracle public key */
  oracleSource: types.OracleSourceKind;
  /** tracks whether the oracle was considered valid at the last AMM update */
  lastOracleValid: boolean;
  /**
   * the target value for `base_asset_amount_per_lp`, used during AMM JIT with LP split
   * precision: BASE_PRECISION
   */
  targetBaseAssetAmountPerLp: number;
  /** expo for unit of per_lp, base 10 (if per_lp_base=X, then per_lp unit is 10^X) */
  perLpBase: number;
  padding1: number;
  padding2: number;
  totalFeeEarnedPerLp: BN;
  netUnsettledFundingPnl: BN;
  quoteAssetAmountWithUnsettledLp: BN;
  referencePriceOffset: number;
  padding: Array<number>;
}

export interface AMMJSON {
  /** oracle price data public key */
  oracle: string;
  /** stores historically witnessed oracle data */
  historicalOracleData: types.HistoricalOracleDataJSON;
  /**
   * accumulated base asset amount since inception per lp share
   * precision: QUOTE_PRECISION
   */
  baseAssetAmountPerLp: string;
  /**
   * accumulated quote asset amount since inception per lp share
   * precision: QUOTE_PRECISION
   */
  quoteAssetAmountPerLp: string;
  /** partition of fees from perp market trading moved from pnl settlements */
  feePool: types.PoolBalanceJSON;
  /**
   * `x` reserves for constant product mm formula (x * y = k)
   * precision: AMM_RESERVE_PRECISION
   */
  baseAssetReserve: string;
  /**
   * `y` reserves for constant product mm formula (x * y = k)
   * precision: AMM_RESERVE_PRECISION
   */
  quoteAssetReserve: string;
  /**
   * determines how close the min/max base asset reserve sit vs base reserves
   * allow for decreasing slippage without increasing liquidity and v.v.
   * precision: PERCENTAGE_PRECISION
   */
  concentrationCoef: string;
  /**
   * minimum base_asset_reserve allowed before AMM is unavailable
   * precision: AMM_RESERVE_PRECISION
   */
  minBaseAssetReserve: string;
  /**
   * maximum base_asset_reserve allowed before AMM is unavailable
   * precision: AMM_RESERVE_PRECISION
   */
  maxBaseAssetReserve: string;
  /**
   * `sqrt(k)` in constant product mm formula (x * y = k). stored to avoid drift caused by integer math issues
   * precision: AMM_RESERVE_PRECISION
   */
  sqrtK: string;
  /**
   * normalizing numerical factor for y, its use offers lowest slippage in cp-curve when market is balanced
   * precision: PEG_PRECISION
   */
  pegMultiplier: string;
  /**
   * y when market is balanced. stored to save computation
   * precision: AMM_RESERVE_PRECISION
   */
  terminalQuoteAssetReserve: string;
  /**
   * always non-negative. tracks number of total longs in market (regardless of counterparty)
   * precision: BASE_PRECISION
   */
  baseAssetAmountLong: string;
  /**
   * always non-positive. tracks number of total shorts in market (regardless of counterparty)
   * precision: BASE_PRECISION
   */
  baseAssetAmountShort: string;
  /**
   * tracks net position (longs-shorts) in market with AMM as counterparty
   * precision: BASE_PRECISION
   */
  baseAssetAmountWithAmm: string;
  /**
   * tracks net position (longs-shorts) in market with LPs as counterparty
   * precision: BASE_PRECISION
   */
  baseAssetAmountWithUnsettledLp: string;
  /**
   * max allowed open interest, blocks trades that breach this value
   * precision: BASE_PRECISION
   */
  maxOpenInterest: string;
  /**
   * sum of all user's perp quote_asset_amount in market
   * precision: QUOTE_PRECISION
   */
  quoteAssetAmount: string;
  /**
   * sum of all long user's quote_entry_amount in market
   * precision: QUOTE_PRECISION
   */
  quoteEntryAmountLong: string;
  /**
   * sum of all short user's quote_entry_amount in market
   * precision: QUOTE_PRECISION
   */
  quoteEntryAmountShort: string;
  /**
   * sum of all long user's quote_break_even_amount in market
   * precision: QUOTE_PRECISION
   */
  quoteBreakEvenAmountLong: string;
  /**
   * sum of all short user's quote_break_even_amount in market
   * precision: QUOTE_PRECISION
   */
  quoteBreakEvenAmountShort: string;
  /**
   * total user lp shares of sqrt_k (protocol owned liquidity = sqrt_k - last_funding_rate)
   * precision: AMM_RESERVE_PRECISION
   */
  userLpShares: string;
  /**
   * last funding rate in this perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  lastFundingRate: string;
  /**
   * last funding rate for longs in this perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  lastFundingRateLong: string;
  /**
   * last funding rate for shorts in this perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  lastFundingRateShort: string;
  /**
   * estimate of last 24h of funding rate perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  last24hAvgFundingRate: string;
  /**
   * total fees collected by this perp market
   * precision: QUOTE_PRECISION
   */
  totalFee: string;
  /**
   * total fees collected by the vAMM's bid/ask spread
   * precision: QUOTE_PRECISION
   */
  totalMmFee: string;
  /**
   * total fees collected by exchange fee schedule
   * precision: QUOTE_PRECISION
   */
  totalExchangeFee: string;
  /**
   * total fees minus any recognized upnl and pool withdraws
   * precision: QUOTE_PRECISION
   */
  totalFeeMinusDistributions: string;
  /**
   * sum of all fees from fee pool withdrawn to revenue pool
   * precision: QUOTE_PRECISION
   */
  totalFeeWithdrawn: string;
  /**
   * all fees collected by market for liquidations
   * precision: QUOTE_PRECISION
   */
  totalLiquidationFee: string;
  /** accumulated funding rate for longs since inception in market */
  cumulativeFundingRateLong: string;
  /** accumulated funding rate for shorts since inception in market */
  cumulativeFundingRateShort: string;
  /** accumulated social loss paid by users since inception in market */
  totalSocialLoss: string;
  /**
   * transformed base_asset_reserve for users going long
   * precision: AMM_RESERVE_PRECISION
   */
  askBaseAssetReserve: string;
  /**
   * transformed quote_asset_reserve for users going long
   * precision: AMM_RESERVE_PRECISION
   */
  askQuoteAssetReserve: string;
  /**
   * transformed base_asset_reserve for users going short
   * precision: AMM_RESERVE_PRECISION
   */
  bidBaseAssetReserve: string;
  /**
   * transformed quote_asset_reserve for users going short
   * precision: AMM_RESERVE_PRECISION
   */
  bidQuoteAssetReserve: string;
  /**
   * the last seen oracle price partially shrunk toward the amm reserve price
   * precision: PRICE_PRECISION
   */
  lastOracleNormalisedPrice: string;
  /** the gap between the oracle price and the reserve price = y * peg_multiplier / x */
  lastOracleReservePriceSpreadPct: string;
  /**
   * average estimate of bid price over funding_period
   * precision: PRICE_PRECISION
   */
  lastBidPriceTwap: string;
  /**
   * average estimate of ask price over funding_period
   * precision: PRICE_PRECISION
   */
  lastAskPriceTwap: string;
  /**
   * average estimate of (bid+ask)/2 price over funding_period
   * precision: PRICE_PRECISION
   */
  lastMarkPriceTwap: string;
  /** average estimate of (bid+ask)/2 price over FIVE_MINUTES */
  lastMarkPriceTwap5min: string;
  /** the last blockchain slot the amm was updated */
  lastUpdateSlot: string;
  /**
   * the pct size of the oracle confidence interval
   * precision: PERCENTAGE_PRECISION
   */
  lastOracleConfPct: string;
  /**
   * the total_fee_minus_distribution change since the last funding update
   * precision: QUOTE_PRECISION
   */
  netRevenueSinceLastFunding: string;
  /** the last funding rate update unix_timestamp */
  lastFundingRateTs: string;
  /** the peridocity of the funding rate updates */
  fundingPeriod: string;
  /**
   * the base step size (increment) of orders
   * precision: BASE_PRECISION
   */
  orderStepSize: string;
  /**
   * the price tick size of orders
   * precision: PRICE_PRECISION
   */
  orderTickSize: string;
  /**
   * the minimum base size of an order
   * precision: BASE_PRECISION
   */
  minOrderSize: string;
  /**
   * the max base size a single user can have
   * precision: BASE_PRECISION
   */
  maxPositionSize: string;
  /**
   * estimated total of volume in market
   * QUOTE_PRECISION
   */
  volume24h: string;
  /** the volume intensity of long fills against AMM */
  longIntensityVolume: string;
  /** the volume intensity of short fills against AMM */
  shortIntensityVolume: string;
  /** the blockchain unix timestamp at the time of the last trade */
  lastTradeTs: string;
  /**
   * estimate of standard deviation of the fill (mark) prices
   * precision: PRICE_PRECISION
   */
  markStd: string;
  /**
   * estimate of standard deviation of the oracle price at each update
   * precision: PRICE_PRECISION
   */
  oracleStd: string;
  /** the last unix_timestamp the mark twap was updated */
  lastMarkPriceTwapTs: string;
  /** the minimum spread the AMM can quote. also used as step size for some spread logic increases. */
  baseSpread: number;
  /** the maximum spread the AMM can quote */
  maxSpread: number;
  /** the spread for asks vs the reserve price */
  longSpread: number;
  /** the spread for bids vs the reserve price */
  shortSpread: number;
  /** the count intensity of long fills against AMM */
  longIntensityCount: number;
  /** the count intensity of short fills against AMM */
  shortIntensityCount: number;
  /** the fraction of total available liquidity a single fill on the AMM can consume */
  maxFillReserveFraction: number;
  /** the maximum slippage a single fill on the AMM can push */
  maxSlippageRatio: number;
  /** the update intensity of AMM formulaic updates (adjusting k). 0-100 */
  curveUpdateIntensity: number;
  /**
   * the jit intensity of AMM. larger intensity means larger participation in jit. 0 means no jit participation.
   * (0, 100] is intensity for protocol-owned AMM. (100, 200] is intensity for user LP-owned AMM.
   */
  ammJitIntensity: number;
  /** the oracle provider information. used to decode/scale the oracle public key */
  oracleSource: types.OracleSourceJSON;
  /** tracks whether the oracle was considered valid at the last AMM update */
  lastOracleValid: boolean;
  /**
   * the target value for `base_asset_amount_per_lp`, used during AMM JIT with LP split
   * precision: BASE_PRECISION
   */
  targetBaseAssetAmountPerLp: number;
  /** expo for unit of per_lp, base 10 (if per_lp_base=X, then per_lp unit is 10^X) */
  perLpBase: number;
  padding1: number;
  padding2: number;
  totalFeeEarnedPerLp: string;
  netUnsettledFundingPnl: string;
  quoteAssetAmountWithUnsettledLp: string;
  referencePriceOffset: number;
  padding: Array<number>;
}

export class AMM {
  /** oracle price data public key */
  readonly oracle: PublicKey;
  /** stores historically witnessed oracle data */
  readonly historicalOracleData: types.HistoricalOracleData;
  /**
   * accumulated base asset amount since inception per lp share
   * precision: QUOTE_PRECISION
   */
  readonly baseAssetAmountPerLp: BN;
  /**
   * accumulated quote asset amount since inception per lp share
   * precision: QUOTE_PRECISION
   */
  readonly quoteAssetAmountPerLp: BN;
  /** partition of fees from perp market trading moved from pnl settlements */
  readonly feePool: types.PoolBalance;
  /**
   * `x` reserves for constant product mm formula (x * y = k)
   * precision: AMM_RESERVE_PRECISION
   */
  readonly baseAssetReserve: BN;
  /**
   * `y` reserves for constant product mm formula (x * y = k)
   * precision: AMM_RESERVE_PRECISION
   */
  readonly quoteAssetReserve: BN;
  /**
   * determines how close the min/max base asset reserve sit vs base reserves
   * allow for decreasing slippage without increasing liquidity and v.v.
   * precision: PERCENTAGE_PRECISION
   */
  readonly concentrationCoef: BN;
  /**
   * minimum base_asset_reserve allowed before AMM is unavailable
   * precision: AMM_RESERVE_PRECISION
   */
  readonly minBaseAssetReserve: BN;
  /**
   * maximum base_asset_reserve allowed before AMM is unavailable
   * precision: AMM_RESERVE_PRECISION
   */
  readonly maxBaseAssetReserve: BN;
  /**
   * `sqrt(k)` in constant product mm formula (x * y = k). stored to avoid drift caused by integer math issues
   * precision: AMM_RESERVE_PRECISION
   */
  readonly sqrtK: BN;
  /**
   * normalizing numerical factor for y, its use offers lowest slippage in cp-curve when market is balanced
   * precision: PEG_PRECISION
   */
  readonly pegMultiplier: BN;
  /**
   * y when market is balanced. stored to save computation
   * precision: AMM_RESERVE_PRECISION
   */
  readonly terminalQuoteAssetReserve: BN;
  /**
   * always non-negative. tracks number of total longs in market (regardless of counterparty)
   * precision: BASE_PRECISION
   */
  readonly baseAssetAmountLong: BN;
  /**
   * always non-positive. tracks number of total shorts in market (regardless of counterparty)
   * precision: BASE_PRECISION
   */
  readonly baseAssetAmountShort: BN;
  /**
   * tracks net position (longs-shorts) in market with AMM as counterparty
   * precision: BASE_PRECISION
   */
  readonly baseAssetAmountWithAmm: BN;
  /**
   * tracks net position (longs-shorts) in market with LPs as counterparty
   * precision: BASE_PRECISION
   */
  readonly baseAssetAmountWithUnsettledLp: BN;
  /**
   * max allowed open interest, blocks trades that breach this value
   * precision: BASE_PRECISION
   */
  readonly maxOpenInterest: BN;
  /**
   * sum of all user's perp quote_asset_amount in market
   * precision: QUOTE_PRECISION
   */
  readonly quoteAssetAmount: BN;
  /**
   * sum of all long user's quote_entry_amount in market
   * precision: QUOTE_PRECISION
   */
  readonly quoteEntryAmountLong: BN;
  /**
   * sum of all short user's quote_entry_amount in market
   * precision: QUOTE_PRECISION
   */
  readonly quoteEntryAmountShort: BN;
  /**
   * sum of all long user's quote_break_even_amount in market
   * precision: QUOTE_PRECISION
   */
  readonly quoteBreakEvenAmountLong: BN;
  /**
   * sum of all short user's quote_break_even_amount in market
   * precision: QUOTE_PRECISION
   */
  readonly quoteBreakEvenAmountShort: BN;
  /**
   * total user lp shares of sqrt_k (protocol owned liquidity = sqrt_k - last_funding_rate)
   * precision: AMM_RESERVE_PRECISION
   */
  readonly userLpShares: BN;
  /**
   * last funding rate in this perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  readonly lastFundingRate: BN;
  /**
   * last funding rate for longs in this perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  readonly lastFundingRateLong: BN;
  /**
   * last funding rate for shorts in this perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  readonly lastFundingRateShort: BN;
  /**
   * estimate of last 24h of funding rate perp market (unit is quote per base)
   * precision: QUOTE_PRECISION
   */
  readonly last24hAvgFundingRate: BN;
  /**
   * total fees collected by this perp market
   * precision: QUOTE_PRECISION
   */
  readonly totalFee: BN;
  /**
   * total fees collected by the vAMM's bid/ask spread
   * precision: QUOTE_PRECISION
   */
  readonly totalMmFee: BN;
  /**
   * total fees collected by exchange fee schedule
   * precision: QUOTE_PRECISION
   */
  readonly totalExchangeFee: BN;
  /**
   * total fees minus any recognized upnl and pool withdraws
   * precision: QUOTE_PRECISION
   */
  readonly totalFeeMinusDistributions: BN;
  /**
   * sum of all fees from fee pool withdrawn to revenue pool
   * precision: QUOTE_PRECISION
   */
  readonly totalFeeWithdrawn: BN;
  /**
   * all fees collected by market for liquidations
   * precision: QUOTE_PRECISION
   */
  readonly totalLiquidationFee: BN;
  /** accumulated funding rate for longs since inception in market */
  readonly cumulativeFundingRateLong: BN;
  /** accumulated funding rate for shorts since inception in market */
  readonly cumulativeFundingRateShort: BN;
  /** accumulated social loss paid by users since inception in market */
  readonly totalSocialLoss: BN;
  /**
   * transformed base_asset_reserve for users going long
   * precision: AMM_RESERVE_PRECISION
   */
  readonly askBaseAssetReserve: BN;
  /**
   * transformed quote_asset_reserve for users going long
   * precision: AMM_RESERVE_PRECISION
   */
  readonly askQuoteAssetReserve: BN;
  /**
   * transformed base_asset_reserve for users going short
   * precision: AMM_RESERVE_PRECISION
   */
  readonly bidBaseAssetReserve: BN;
  /**
   * transformed quote_asset_reserve for users going short
   * precision: AMM_RESERVE_PRECISION
   */
  readonly bidQuoteAssetReserve: BN;
  /**
   * the last seen oracle price partially shrunk toward the amm reserve price
   * precision: PRICE_PRECISION
   */
  readonly lastOracleNormalisedPrice: BN;
  /** the gap between the oracle price and the reserve price = y * peg_multiplier / x */
  readonly lastOracleReservePriceSpreadPct: BN;
  /**
   * average estimate of bid price over funding_period
   * precision: PRICE_PRECISION
   */
  readonly lastBidPriceTwap: BN;
  /**
   * average estimate of ask price over funding_period
   * precision: PRICE_PRECISION
   */
  readonly lastAskPriceTwap: BN;
  /**
   * average estimate of (bid+ask)/2 price over funding_period
   * precision: PRICE_PRECISION
   */
  readonly lastMarkPriceTwap: BN;
  /** average estimate of (bid+ask)/2 price over FIVE_MINUTES */
  readonly lastMarkPriceTwap5min: BN;
  /** the last blockchain slot the amm was updated */
  readonly lastUpdateSlot: BN;
  /**
   * the pct size of the oracle confidence interval
   * precision: PERCENTAGE_PRECISION
   */
  readonly lastOracleConfPct: BN;
  /**
   * the total_fee_minus_distribution change since the last funding update
   * precision: QUOTE_PRECISION
   */
  readonly netRevenueSinceLastFunding: BN;
  /** the last funding rate update unix_timestamp */
  readonly lastFundingRateTs: BN;
  /** the peridocity of the funding rate updates */
  readonly fundingPeriod: BN;
  /**
   * the base step size (increment) of orders
   * precision: BASE_PRECISION
   */
  readonly orderStepSize: BN;
  /**
   * the price tick size of orders
   * precision: PRICE_PRECISION
   */
  readonly orderTickSize: BN;
  /**
   * the minimum base size of an order
   * precision: BASE_PRECISION
   */
  readonly minOrderSize: BN;
  /**
   * the max base size a single user can have
   * precision: BASE_PRECISION
   */
  readonly maxPositionSize: BN;
  /**
   * estimated total of volume in market
   * QUOTE_PRECISION
   */
  readonly volume24h: BN;
  /** the volume intensity of long fills against AMM */
  readonly longIntensityVolume: BN;
  /** the volume intensity of short fills against AMM */
  readonly shortIntensityVolume: BN;
  /** the blockchain unix timestamp at the time of the last trade */
  readonly lastTradeTs: BN;
  /**
   * estimate of standard deviation of the fill (mark) prices
   * precision: PRICE_PRECISION
   */
  readonly markStd: BN;
  /**
   * estimate of standard deviation of the oracle price at each update
   * precision: PRICE_PRECISION
   */
  readonly oracleStd: BN;
  /** the last unix_timestamp the mark twap was updated */
  readonly lastMarkPriceTwapTs: BN;
  /** the minimum spread the AMM can quote. also used as step size for some spread logic increases. */
  readonly baseSpread: number;
  /** the maximum spread the AMM can quote */
  readonly maxSpread: number;
  /** the spread for asks vs the reserve price */
  readonly longSpread: number;
  /** the spread for bids vs the reserve price */
  readonly shortSpread: number;
  /** the count intensity of long fills against AMM */
  readonly longIntensityCount: number;
  /** the count intensity of short fills against AMM */
  readonly shortIntensityCount: number;
  /** the fraction of total available liquidity a single fill on the AMM can consume */
  readonly maxFillReserveFraction: number;
  /** the maximum slippage a single fill on the AMM can push */
  readonly maxSlippageRatio: number;
  /** the update intensity of AMM formulaic updates (adjusting k). 0-100 */
  readonly curveUpdateIntensity: number;
  /**
   * the jit intensity of AMM. larger intensity means larger participation in jit. 0 means no jit participation.
   * (0, 100] is intensity for protocol-owned AMM. (100, 200] is intensity for user LP-owned AMM.
   */
  readonly ammJitIntensity: number;
  /** the oracle provider information. used to decode/scale the oracle public key */
  readonly oracleSource: types.OracleSourceKind;
  /** tracks whether the oracle was considered valid at the last AMM update */
  readonly lastOracleValid: boolean;
  /**
   * the target value for `base_asset_amount_per_lp`, used during AMM JIT with LP split
   * precision: BASE_PRECISION
   */
  readonly targetBaseAssetAmountPerLp: number;
  /** expo for unit of per_lp, base 10 (if per_lp_base=X, then per_lp unit is 10^X) */
  readonly perLpBase: number;
  readonly padding1: number;
  readonly padding2: number;
  readonly totalFeeEarnedPerLp: BN;
  readonly netUnsettledFundingPnl: BN;
  readonly quoteAssetAmountWithUnsettledLp: BN;
  readonly referencePriceOffset: number;
  readonly padding: Array<number>;

  constructor(fields: AMMFields) {
    this.oracle = fields.oracle;
    this.historicalOracleData = new types.HistoricalOracleData({
      ...fields.historicalOracleData,
    });
    this.baseAssetAmountPerLp = fields.baseAssetAmountPerLp;
    this.quoteAssetAmountPerLp = fields.quoteAssetAmountPerLp;
    this.feePool = new types.PoolBalance({ ...fields.feePool });
    this.baseAssetReserve = fields.baseAssetReserve;
    this.quoteAssetReserve = fields.quoteAssetReserve;
    this.concentrationCoef = fields.concentrationCoef;
    this.minBaseAssetReserve = fields.minBaseAssetReserve;
    this.maxBaseAssetReserve = fields.maxBaseAssetReserve;
    this.sqrtK = fields.sqrtK;
    this.pegMultiplier = fields.pegMultiplier;
    this.terminalQuoteAssetReserve = fields.terminalQuoteAssetReserve;
    this.baseAssetAmountLong = fields.baseAssetAmountLong;
    this.baseAssetAmountShort = fields.baseAssetAmountShort;
    this.baseAssetAmountWithAmm = fields.baseAssetAmountWithAmm;
    this.baseAssetAmountWithUnsettledLp = fields.baseAssetAmountWithUnsettledLp;
    this.maxOpenInterest = fields.maxOpenInterest;
    this.quoteAssetAmount = fields.quoteAssetAmount;
    this.quoteEntryAmountLong = fields.quoteEntryAmountLong;
    this.quoteEntryAmountShort = fields.quoteEntryAmountShort;
    this.quoteBreakEvenAmountLong = fields.quoteBreakEvenAmountLong;
    this.quoteBreakEvenAmountShort = fields.quoteBreakEvenAmountShort;
    this.userLpShares = fields.userLpShares;
    this.lastFundingRate = fields.lastFundingRate;
    this.lastFundingRateLong = fields.lastFundingRateLong;
    this.lastFundingRateShort = fields.lastFundingRateShort;
    this.last24hAvgFundingRate = fields.last24hAvgFundingRate;
    this.totalFee = fields.totalFee;
    this.totalMmFee = fields.totalMmFee;
    this.totalExchangeFee = fields.totalExchangeFee;
    this.totalFeeMinusDistributions = fields.totalFeeMinusDistributions;
    this.totalFeeWithdrawn = fields.totalFeeWithdrawn;
    this.totalLiquidationFee = fields.totalLiquidationFee;
    this.cumulativeFundingRateLong = fields.cumulativeFundingRateLong;
    this.cumulativeFundingRateShort = fields.cumulativeFundingRateShort;
    this.totalSocialLoss = fields.totalSocialLoss;
    this.askBaseAssetReserve = fields.askBaseAssetReserve;
    this.askQuoteAssetReserve = fields.askQuoteAssetReserve;
    this.bidBaseAssetReserve = fields.bidBaseAssetReserve;
    this.bidQuoteAssetReserve = fields.bidQuoteAssetReserve;
    this.lastOracleNormalisedPrice = fields.lastOracleNormalisedPrice;
    this.lastOracleReservePriceSpreadPct =
      fields.lastOracleReservePriceSpreadPct;
    this.lastBidPriceTwap = fields.lastBidPriceTwap;
    this.lastAskPriceTwap = fields.lastAskPriceTwap;
    this.lastMarkPriceTwap = fields.lastMarkPriceTwap;
    this.lastMarkPriceTwap5min = fields.lastMarkPriceTwap5min;
    this.lastUpdateSlot = fields.lastUpdateSlot;
    this.lastOracleConfPct = fields.lastOracleConfPct;
    this.netRevenueSinceLastFunding = fields.netRevenueSinceLastFunding;
    this.lastFundingRateTs = fields.lastFundingRateTs;
    this.fundingPeriod = fields.fundingPeriod;
    this.orderStepSize = fields.orderStepSize;
    this.orderTickSize = fields.orderTickSize;
    this.minOrderSize = fields.minOrderSize;
    this.maxPositionSize = fields.maxPositionSize;
    this.volume24h = fields.volume24h;
    this.longIntensityVolume = fields.longIntensityVolume;
    this.shortIntensityVolume = fields.shortIntensityVolume;
    this.lastTradeTs = fields.lastTradeTs;
    this.markStd = fields.markStd;
    this.oracleStd = fields.oracleStd;
    this.lastMarkPriceTwapTs = fields.lastMarkPriceTwapTs;
    this.baseSpread = fields.baseSpread;
    this.maxSpread = fields.maxSpread;
    this.longSpread = fields.longSpread;
    this.shortSpread = fields.shortSpread;
    this.longIntensityCount = fields.longIntensityCount;
    this.shortIntensityCount = fields.shortIntensityCount;
    this.maxFillReserveFraction = fields.maxFillReserveFraction;
    this.maxSlippageRatio = fields.maxSlippageRatio;
    this.curveUpdateIntensity = fields.curveUpdateIntensity;
    this.ammJitIntensity = fields.ammJitIntensity;
    this.oracleSource = fields.oracleSource;
    this.lastOracleValid = fields.lastOracleValid;
    this.targetBaseAssetAmountPerLp = fields.targetBaseAssetAmountPerLp;
    this.perLpBase = fields.perLpBase;
    this.padding1 = fields.padding1;
    this.padding2 = fields.padding2;
    this.totalFeeEarnedPerLp = fields.totalFeeEarnedPerLp;
    this.netUnsettledFundingPnl = fields.netUnsettledFundingPnl;
    this.quoteAssetAmountWithUnsettledLp =
      fields.quoteAssetAmountWithUnsettledLp;
    this.referencePriceOffset = fields.referencePriceOffset;
    this.padding = fields.padding;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.publicKey("oracle"),
        types.HistoricalOracleData.layout("historicalOracleData"),
        borsh.i128("baseAssetAmountPerLp"),
        borsh.i128("quoteAssetAmountPerLp"),
        types.PoolBalance.layout("feePool"),
        borsh.u128("baseAssetReserve"),
        borsh.u128("quoteAssetReserve"),
        borsh.u128("concentrationCoef"),
        borsh.u128("minBaseAssetReserve"),
        borsh.u128("maxBaseAssetReserve"),
        borsh.u128("sqrtK"),
        borsh.u128("pegMultiplier"),
        borsh.u128("terminalQuoteAssetReserve"),
        borsh.i128("baseAssetAmountLong"),
        borsh.i128("baseAssetAmountShort"),
        borsh.i128("baseAssetAmountWithAmm"),
        borsh.i128("baseAssetAmountWithUnsettledLp"),
        borsh.u128("maxOpenInterest"),
        borsh.i128("quoteAssetAmount"),
        borsh.i128("quoteEntryAmountLong"),
        borsh.i128("quoteEntryAmountShort"),
        borsh.i128("quoteBreakEvenAmountLong"),
        borsh.i128("quoteBreakEvenAmountShort"),
        borsh.u128("userLpShares"),
        borsh.i64("lastFundingRate"),
        borsh.i64("lastFundingRateLong"),
        borsh.i64("lastFundingRateShort"),
        borsh.i64("last24hAvgFundingRate"),
        borsh.i128("totalFee"),
        borsh.i128("totalMmFee"),
        borsh.u128("totalExchangeFee"),
        borsh.i128("totalFeeMinusDistributions"),
        borsh.u128("totalFeeWithdrawn"),
        borsh.u128("totalLiquidationFee"),
        borsh.i128("cumulativeFundingRateLong"),
        borsh.i128("cumulativeFundingRateShort"),
        borsh.u128("totalSocialLoss"),
        borsh.u128("askBaseAssetReserve"),
        borsh.u128("askQuoteAssetReserve"),
        borsh.u128("bidBaseAssetReserve"),
        borsh.u128("bidQuoteAssetReserve"),
        borsh.i64("lastOracleNormalisedPrice"),
        borsh.i64("lastOracleReservePriceSpreadPct"),
        borsh.u64("lastBidPriceTwap"),
        borsh.u64("lastAskPriceTwap"),
        borsh.u64("lastMarkPriceTwap"),
        borsh.u64("lastMarkPriceTwap5min"),
        borsh.u64("lastUpdateSlot"),
        borsh.u64("lastOracleConfPct"),
        borsh.i64("netRevenueSinceLastFunding"),
        borsh.i64("lastFundingRateTs"),
        borsh.i64("fundingPeriod"),
        borsh.u64("orderStepSize"),
        borsh.u64("orderTickSize"),
        borsh.u64("minOrderSize"),
        borsh.u64("maxPositionSize"),
        borsh.u64("volume24h"),
        borsh.u64("longIntensityVolume"),
        borsh.u64("shortIntensityVolume"),
        borsh.i64("lastTradeTs"),
        borsh.u64("markStd"),
        borsh.u64("oracleStd"),
        borsh.i64("lastMarkPriceTwapTs"),
        borsh.u32("baseSpread"),
        borsh.u32("maxSpread"),
        borsh.u32("longSpread"),
        borsh.u32("shortSpread"),
        borsh.u32("longIntensityCount"),
        borsh.u32("shortIntensityCount"),
        borsh.u16("maxFillReserveFraction"),
        borsh.u16("maxSlippageRatio"),
        borsh.u8("curveUpdateIntensity"),
        borsh.u8("ammJitIntensity"),
        types.OracleSource.layout("oracleSource"),
        borsh.bool("lastOracleValid"),
        borsh.i32("targetBaseAssetAmountPerLp"),
        borsh.i8("perLpBase"),
        borsh.u8("padding1"),
        borsh.u16("padding2"),
        borsh.u64("totalFeeEarnedPerLp"),
        borsh.i64("netUnsettledFundingPnl"),
        borsh.i64("quoteAssetAmountWithUnsettledLp"),
        borsh.i32("referencePriceOffset"),
        borsh.array(borsh.u8(), 12, "padding"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new AMM({
      oracle: obj.oracle,
      historicalOracleData: types.HistoricalOracleData.fromDecoded(
        obj.historicalOracleData
      ),
      baseAssetAmountPerLp: obj.baseAssetAmountPerLp,
      quoteAssetAmountPerLp: obj.quoteAssetAmountPerLp,
      feePool: types.PoolBalance.fromDecoded(obj.feePool),
      baseAssetReserve: obj.baseAssetReserve,
      quoteAssetReserve: obj.quoteAssetReserve,
      concentrationCoef: obj.concentrationCoef,
      minBaseAssetReserve: obj.minBaseAssetReserve,
      maxBaseAssetReserve: obj.maxBaseAssetReserve,
      sqrtK: obj.sqrtK,
      pegMultiplier: obj.pegMultiplier,
      terminalQuoteAssetReserve: obj.terminalQuoteAssetReserve,
      baseAssetAmountLong: obj.baseAssetAmountLong,
      baseAssetAmountShort: obj.baseAssetAmountShort,
      baseAssetAmountWithAmm: obj.baseAssetAmountWithAmm,
      baseAssetAmountWithUnsettledLp: obj.baseAssetAmountWithUnsettledLp,
      maxOpenInterest: obj.maxOpenInterest,
      quoteAssetAmount: obj.quoteAssetAmount,
      quoteEntryAmountLong: obj.quoteEntryAmountLong,
      quoteEntryAmountShort: obj.quoteEntryAmountShort,
      quoteBreakEvenAmountLong: obj.quoteBreakEvenAmountLong,
      quoteBreakEvenAmountShort: obj.quoteBreakEvenAmountShort,
      userLpShares: obj.userLpShares,
      lastFundingRate: obj.lastFundingRate,
      lastFundingRateLong: obj.lastFundingRateLong,
      lastFundingRateShort: obj.lastFundingRateShort,
      last24hAvgFundingRate: obj.last24hAvgFundingRate,
      totalFee: obj.totalFee,
      totalMmFee: obj.totalMmFee,
      totalExchangeFee: obj.totalExchangeFee,
      totalFeeMinusDistributions: obj.totalFeeMinusDistributions,
      totalFeeWithdrawn: obj.totalFeeWithdrawn,
      totalLiquidationFee: obj.totalLiquidationFee,
      cumulativeFundingRateLong: obj.cumulativeFundingRateLong,
      cumulativeFundingRateShort: obj.cumulativeFundingRateShort,
      totalSocialLoss: obj.totalSocialLoss,
      askBaseAssetReserve: obj.askBaseAssetReserve,
      askQuoteAssetReserve: obj.askQuoteAssetReserve,
      bidBaseAssetReserve: obj.bidBaseAssetReserve,
      bidQuoteAssetReserve: obj.bidQuoteAssetReserve,
      lastOracleNormalisedPrice: obj.lastOracleNormalisedPrice,
      lastOracleReservePriceSpreadPct: obj.lastOracleReservePriceSpreadPct,
      lastBidPriceTwap: obj.lastBidPriceTwap,
      lastAskPriceTwap: obj.lastAskPriceTwap,
      lastMarkPriceTwap: obj.lastMarkPriceTwap,
      lastMarkPriceTwap5min: obj.lastMarkPriceTwap5min,
      lastUpdateSlot: obj.lastUpdateSlot,
      lastOracleConfPct: obj.lastOracleConfPct,
      netRevenueSinceLastFunding: obj.netRevenueSinceLastFunding,
      lastFundingRateTs: obj.lastFundingRateTs,
      fundingPeriod: obj.fundingPeriod,
      orderStepSize: obj.orderStepSize,
      orderTickSize: obj.orderTickSize,
      minOrderSize: obj.minOrderSize,
      maxPositionSize: obj.maxPositionSize,
      volume24h: obj.volume24h,
      longIntensityVolume: obj.longIntensityVolume,
      shortIntensityVolume: obj.shortIntensityVolume,
      lastTradeTs: obj.lastTradeTs,
      markStd: obj.markStd,
      oracleStd: obj.oracleStd,
      lastMarkPriceTwapTs: obj.lastMarkPriceTwapTs,
      baseSpread: obj.baseSpread,
      maxSpread: obj.maxSpread,
      longSpread: obj.longSpread,
      shortSpread: obj.shortSpread,
      longIntensityCount: obj.longIntensityCount,
      shortIntensityCount: obj.shortIntensityCount,
      maxFillReserveFraction: obj.maxFillReserveFraction,
      maxSlippageRatio: obj.maxSlippageRatio,
      curveUpdateIntensity: obj.curveUpdateIntensity,
      ammJitIntensity: obj.ammJitIntensity,
      oracleSource: types.OracleSource.fromDecoded(obj.oracleSource),
      lastOracleValid: obj.lastOracleValid,
      targetBaseAssetAmountPerLp: obj.targetBaseAssetAmountPerLp,
      perLpBase: obj.perLpBase,
      padding1: obj.padding1,
      padding2: obj.padding2,
      totalFeeEarnedPerLp: obj.totalFeeEarnedPerLp,
      netUnsettledFundingPnl: obj.netUnsettledFundingPnl,
      quoteAssetAmountWithUnsettledLp: obj.quoteAssetAmountWithUnsettledLp,
      referencePriceOffset: obj.referencePriceOffset,
      padding: obj.padding,
    });
  }

  static toEncodable(fields: AMMFields) {
    return {
      oracle: fields.oracle,
      historicalOracleData: types.HistoricalOracleData.toEncodable(
        fields.historicalOracleData
      ),
      baseAssetAmountPerLp: fields.baseAssetAmountPerLp,
      quoteAssetAmountPerLp: fields.quoteAssetAmountPerLp,
      feePool: types.PoolBalance.toEncodable(fields.feePool),
      baseAssetReserve: fields.baseAssetReserve,
      quoteAssetReserve: fields.quoteAssetReserve,
      concentrationCoef: fields.concentrationCoef,
      minBaseAssetReserve: fields.minBaseAssetReserve,
      maxBaseAssetReserve: fields.maxBaseAssetReserve,
      sqrtK: fields.sqrtK,
      pegMultiplier: fields.pegMultiplier,
      terminalQuoteAssetReserve: fields.terminalQuoteAssetReserve,
      baseAssetAmountLong: fields.baseAssetAmountLong,
      baseAssetAmountShort: fields.baseAssetAmountShort,
      baseAssetAmountWithAmm: fields.baseAssetAmountWithAmm,
      baseAssetAmountWithUnsettledLp: fields.baseAssetAmountWithUnsettledLp,
      maxOpenInterest: fields.maxOpenInterest,
      quoteAssetAmount: fields.quoteAssetAmount,
      quoteEntryAmountLong: fields.quoteEntryAmountLong,
      quoteEntryAmountShort: fields.quoteEntryAmountShort,
      quoteBreakEvenAmountLong: fields.quoteBreakEvenAmountLong,
      quoteBreakEvenAmountShort: fields.quoteBreakEvenAmountShort,
      userLpShares: fields.userLpShares,
      lastFundingRate: fields.lastFundingRate,
      lastFundingRateLong: fields.lastFundingRateLong,
      lastFundingRateShort: fields.lastFundingRateShort,
      last24hAvgFundingRate: fields.last24hAvgFundingRate,
      totalFee: fields.totalFee,
      totalMmFee: fields.totalMmFee,
      totalExchangeFee: fields.totalExchangeFee,
      totalFeeMinusDistributions: fields.totalFeeMinusDistributions,
      totalFeeWithdrawn: fields.totalFeeWithdrawn,
      totalLiquidationFee: fields.totalLiquidationFee,
      cumulativeFundingRateLong: fields.cumulativeFundingRateLong,
      cumulativeFundingRateShort: fields.cumulativeFundingRateShort,
      totalSocialLoss: fields.totalSocialLoss,
      askBaseAssetReserve: fields.askBaseAssetReserve,
      askQuoteAssetReserve: fields.askQuoteAssetReserve,
      bidBaseAssetReserve: fields.bidBaseAssetReserve,
      bidQuoteAssetReserve: fields.bidQuoteAssetReserve,
      lastOracleNormalisedPrice: fields.lastOracleNormalisedPrice,
      lastOracleReservePriceSpreadPct: fields.lastOracleReservePriceSpreadPct,
      lastBidPriceTwap: fields.lastBidPriceTwap,
      lastAskPriceTwap: fields.lastAskPriceTwap,
      lastMarkPriceTwap: fields.lastMarkPriceTwap,
      lastMarkPriceTwap5min: fields.lastMarkPriceTwap5min,
      lastUpdateSlot: fields.lastUpdateSlot,
      lastOracleConfPct: fields.lastOracleConfPct,
      netRevenueSinceLastFunding: fields.netRevenueSinceLastFunding,
      lastFundingRateTs: fields.lastFundingRateTs,
      fundingPeriod: fields.fundingPeriod,
      orderStepSize: fields.orderStepSize,
      orderTickSize: fields.orderTickSize,
      minOrderSize: fields.minOrderSize,
      maxPositionSize: fields.maxPositionSize,
      volume24h: fields.volume24h,
      longIntensityVolume: fields.longIntensityVolume,
      shortIntensityVolume: fields.shortIntensityVolume,
      lastTradeTs: fields.lastTradeTs,
      markStd: fields.markStd,
      oracleStd: fields.oracleStd,
      lastMarkPriceTwapTs: fields.lastMarkPriceTwapTs,
      baseSpread: fields.baseSpread,
      maxSpread: fields.maxSpread,
      longSpread: fields.longSpread,
      shortSpread: fields.shortSpread,
      longIntensityCount: fields.longIntensityCount,
      shortIntensityCount: fields.shortIntensityCount,
      maxFillReserveFraction: fields.maxFillReserveFraction,
      maxSlippageRatio: fields.maxSlippageRatio,
      curveUpdateIntensity: fields.curveUpdateIntensity,
      ammJitIntensity: fields.ammJitIntensity,
      oracleSource: fields.oracleSource.toEncodable(),
      lastOracleValid: fields.lastOracleValid,
      targetBaseAssetAmountPerLp: fields.targetBaseAssetAmountPerLp,
      perLpBase: fields.perLpBase,
      padding1: fields.padding1,
      padding2: fields.padding2,
      totalFeeEarnedPerLp: fields.totalFeeEarnedPerLp,
      netUnsettledFundingPnl: fields.netUnsettledFundingPnl,
      quoteAssetAmountWithUnsettledLp: fields.quoteAssetAmountWithUnsettledLp,
      referencePriceOffset: fields.referencePriceOffset,
      padding: fields.padding,
    };
  }

  toJSON(): AMMJSON {
    return {
      oracle: this.oracle.toString(),
      historicalOracleData: this.historicalOracleData.toJSON(),
      baseAssetAmountPerLp: this.baseAssetAmountPerLp.toString(),
      quoteAssetAmountPerLp: this.quoteAssetAmountPerLp.toString(),
      feePool: this.feePool.toJSON(),
      baseAssetReserve: this.baseAssetReserve.toString(),
      quoteAssetReserve: this.quoteAssetReserve.toString(),
      concentrationCoef: this.concentrationCoef.toString(),
      minBaseAssetReserve: this.minBaseAssetReserve.toString(),
      maxBaseAssetReserve: this.maxBaseAssetReserve.toString(),
      sqrtK: this.sqrtK.toString(),
      pegMultiplier: this.pegMultiplier.toString(),
      terminalQuoteAssetReserve: this.terminalQuoteAssetReserve.toString(),
      baseAssetAmountLong: this.baseAssetAmountLong.toString(),
      baseAssetAmountShort: this.baseAssetAmountShort.toString(),
      baseAssetAmountWithAmm: this.baseAssetAmountWithAmm.toString(),
      baseAssetAmountWithUnsettledLp:
        this.baseAssetAmountWithUnsettledLp.toString(),
      maxOpenInterest: this.maxOpenInterest.toString(),
      quoteAssetAmount: this.quoteAssetAmount.toString(),
      quoteEntryAmountLong: this.quoteEntryAmountLong.toString(),
      quoteEntryAmountShort: this.quoteEntryAmountShort.toString(),
      quoteBreakEvenAmountLong: this.quoteBreakEvenAmountLong.toString(),
      quoteBreakEvenAmountShort: this.quoteBreakEvenAmountShort.toString(),
      userLpShares: this.userLpShares.toString(),
      lastFundingRate: this.lastFundingRate.toString(),
      lastFundingRateLong: this.lastFundingRateLong.toString(),
      lastFundingRateShort: this.lastFundingRateShort.toString(),
      last24hAvgFundingRate: this.last24hAvgFundingRate.toString(),
      totalFee: this.totalFee.toString(),
      totalMmFee: this.totalMmFee.toString(),
      totalExchangeFee: this.totalExchangeFee.toString(),
      totalFeeMinusDistributions: this.totalFeeMinusDistributions.toString(),
      totalFeeWithdrawn: this.totalFeeWithdrawn.toString(),
      totalLiquidationFee: this.totalLiquidationFee.toString(),
      cumulativeFundingRateLong: this.cumulativeFundingRateLong.toString(),
      cumulativeFundingRateShort: this.cumulativeFundingRateShort.toString(),
      totalSocialLoss: this.totalSocialLoss.toString(),
      askBaseAssetReserve: this.askBaseAssetReserve.toString(),
      askQuoteAssetReserve: this.askQuoteAssetReserve.toString(),
      bidBaseAssetReserve: this.bidBaseAssetReserve.toString(),
      bidQuoteAssetReserve: this.bidQuoteAssetReserve.toString(),
      lastOracleNormalisedPrice: this.lastOracleNormalisedPrice.toString(),
      lastOracleReservePriceSpreadPct:
        this.lastOracleReservePriceSpreadPct.toString(),
      lastBidPriceTwap: this.lastBidPriceTwap.toString(),
      lastAskPriceTwap: this.lastAskPriceTwap.toString(),
      lastMarkPriceTwap: this.lastMarkPriceTwap.toString(),
      lastMarkPriceTwap5min: this.lastMarkPriceTwap5min.toString(),
      lastUpdateSlot: this.lastUpdateSlot.toString(),
      lastOracleConfPct: this.lastOracleConfPct.toString(),
      netRevenueSinceLastFunding: this.netRevenueSinceLastFunding.toString(),
      lastFundingRateTs: this.lastFundingRateTs.toString(),
      fundingPeriod: this.fundingPeriod.toString(),
      orderStepSize: this.orderStepSize.toString(),
      orderTickSize: this.orderTickSize.toString(),
      minOrderSize: this.minOrderSize.toString(),
      maxPositionSize: this.maxPositionSize.toString(),
      volume24h: this.volume24h.toString(),
      longIntensityVolume: this.longIntensityVolume.toString(),
      shortIntensityVolume: this.shortIntensityVolume.toString(),
      lastTradeTs: this.lastTradeTs.toString(),
      markStd: this.markStd.toString(),
      oracleStd: this.oracleStd.toString(),
      lastMarkPriceTwapTs: this.lastMarkPriceTwapTs.toString(),
      baseSpread: this.baseSpread,
      maxSpread: this.maxSpread,
      longSpread: this.longSpread,
      shortSpread: this.shortSpread,
      longIntensityCount: this.longIntensityCount,
      shortIntensityCount: this.shortIntensityCount,
      maxFillReserveFraction: this.maxFillReserveFraction,
      maxSlippageRatio: this.maxSlippageRatio,
      curveUpdateIntensity: this.curveUpdateIntensity,
      ammJitIntensity: this.ammJitIntensity,
      oracleSource: this.oracleSource.toJSON(),
      lastOracleValid: this.lastOracleValid,
      targetBaseAssetAmountPerLp: this.targetBaseAssetAmountPerLp,
      perLpBase: this.perLpBase,
      padding1: this.padding1,
      padding2: this.padding2,
      totalFeeEarnedPerLp: this.totalFeeEarnedPerLp.toString(),
      netUnsettledFundingPnl: this.netUnsettledFundingPnl.toString(),
      quoteAssetAmountWithUnsettledLp:
        this.quoteAssetAmountWithUnsettledLp.toString(),
      referencePriceOffset: this.referencePriceOffset,
      padding: this.padding,
    };
  }

  static fromJSON(obj: AMMJSON): AMM {
    return new AMM({
      oracle: new PublicKey(obj.oracle),
      historicalOracleData: types.HistoricalOracleData.fromJSON(
        obj.historicalOracleData
      ),
      baseAssetAmountPerLp: new BN(obj.baseAssetAmountPerLp),
      quoteAssetAmountPerLp: new BN(obj.quoteAssetAmountPerLp),
      feePool: types.PoolBalance.fromJSON(obj.feePool),
      baseAssetReserve: new BN(obj.baseAssetReserve),
      quoteAssetReserve: new BN(obj.quoteAssetReserve),
      concentrationCoef: new BN(obj.concentrationCoef),
      minBaseAssetReserve: new BN(obj.minBaseAssetReserve),
      maxBaseAssetReserve: new BN(obj.maxBaseAssetReserve),
      sqrtK: new BN(obj.sqrtK),
      pegMultiplier: new BN(obj.pegMultiplier),
      terminalQuoteAssetReserve: new BN(obj.terminalQuoteAssetReserve),
      baseAssetAmountLong: new BN(obj.baseAssetAmountLong),
      baseAssetAmountShort: new BN(obj.baseAssetAmountShort),
      baseAssetAmountWithAmm: new BN(obj.baseAssetAmountWithAmm),
      baseAssetAmountWithUnsettledLp: new BN(
        obj.baseAssetAmountWithUnsettledLp
      ),
      maxOpenInterest: new BN(obj.maxOpenInterest),
      quoteAssetAmount: new BN(obj.quoteAssetAmount),
      quoteEntryAmountLong: new BN(obj.quoteEntryAmountLong),
      quoteEntryAmountShort: new BN(obj.quoteEntryAmountShort),
      quoteBreakEvenAmountLong: new BN(obj.quoteBreakEvenAmountLong),
      quoteBreakEvenAmountShort: new BN(obj.quoteBreakEvenAmountShort),
      userLpShares: new BN(obj.userLpShares),
      lastFundingRate: new BN(obj.lastFundingRate),
      lastFundingRateLong: new BN(obj.lastFundingRateLong),
      lastFundingRateShort: new BN(obj.lastFundingRateShort),
      last24hAvgFundingRate: new BN(obj.last24hAvgFundingRate),
      totalFee: new BN(obj.totalFee),
      totalMmFee: new BN(obj.totalMmFee),
      totalExchangeFee: new BN(obj.totalExchangeFee),
      totalFeeMinusDistributions: new BN(obj.totalFeeMinusDistributions),
      totalFeeWithdrawn: new BN(obj.totalFeeWithdrawn),
      totalLiquidationFee: new BN(obj.totalLiquidationFee),
      cumulativeFundingRateLong: new BN(obj.cumulativeFundingRateLong),
      cumulativeFundingRateShort: new BN(obj.cumulativeFundingRateShort),
      totalSocialLoss: new BN(obj.totalSocialLoss),
      askBaseAssetReserve: new BN(obj.askBaseAssetReserve),
      askQuoteAssetReserve: new BN(obj.askQuoteAssetReserve),
      bidBaseAssetReserve: new BN(obj.bidBaseAssetReserve),
      bidQuoteAssetReserve: new BN(obj.bidQuoteAssetReserve),
      lastOracleNormalisedPrice: new BN(obj.lastOracleNormalisedPrice),
      lastOracleReservePriceSpreadPct: new BN(
        obj.lastOracleReservePriceSpreadPct
      ),
      lastBidPriceTwap: new BN(obj.lastBidPriceTwap),
      lastAskPriceTwap: new BN(obj.lastAskPriceTwap),
      lastMarkPriceTwap: new BN(obj.lastMarkPriceTwap),
      lastMarkPriceTwap5min: new BN(obj.lastMarkPriceTwap5min),
      lastUpdateSlot: new BN(obj.lastUpdateSlot),
      lastOracleConfPct: new BN(obj.lastOracleConfPct),
      netRevenueSinceLastFunding: new BN(obj.netRevenueSinceLastFunding),
      lastFundingRateTs: new BN(obj.lastFundingRateTs),
      fundingPeriod: new BN(obj.fundingPeriod),
      orderStepSize: new BN(obj.orderStepSize),
      orderTickSize: new BN(obj.orderTickSize),
      minOrderSize: new BN(obj.minOrderSize),
      maxPositionSize: new BN(obj.maxPositionSize),
      volume24h: new BN(obj.volume24h),
      longIntensityVolume: new BN(obj.longIntensityVolume),
      shortIntensityVolume: new BN(obj.shortIntensityVolume),
      lastTradeTs: new BN(obj.lastTradeTs),
      markStd: new BN(obj.markStd),
      oracleStd: new BN(obj.oracleStd),
      lastMarkPriceTwapTs: new BN(obj.lastMarkPriceTwapTs),
      baseSpread: obj.baseSpread,
      maxSpread: obj.maxSpread,
      longSpread: obj.longSpread,
      shortSpread: obj.shortSpread,
      longIntensityCount: obj.longIntensityCount,
      shortIntensityCount: obj.shortIntensityCount,
      maxFillReserveFraction: obj.maxFillReserveFraction,
      maxSlippageRatio: obj.maxSlippageRatio,
      curveUpdateIntensity: obj.curveUpdateIntensity,
      ammJitIntensity: obj.ammJitIntensity,
      oracleSource: types.OracleSource.fromJSON(obj.oracleSource),
      lastOracleValid: obj.lastOracleValid,
      targetBaseAssetAmountPerLp: obj.targetBaseAssetAmountPerLp,
      perLpBase: obj.perLpBase,
      padding1: obj.padding1,
      padding2: obj.padding2,
      totalFeeEarnedPerLp: new BN(obj.totalFeeEarnedPerLp),
      netUnsettledFundingPnl: new BN(obj.netUnsettledFundingPnl),
      quoteAssetAmountWithUnsettledLp: new BN(
        obj.quoteAssetAmountWithUnsettledLp
      ),
      referencePriceOffset: obj.referencePriceOffset,
      padding: obj.padding,
    });
  }

  toEncodable() {
    return AMM.toEncodable(this);
  }
}
