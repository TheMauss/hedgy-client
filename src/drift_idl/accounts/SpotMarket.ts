import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface SpotMarketFields {
  /** The address of the spot market. It is a pda of the market index */
  pubkey: PublicKey;
  /** The oracle used to price the markets deposits/borrows */
  oracle: PublicKey;
  /** The token mint of the market */
  mint: PublicKey;
  /**
   * The vault used to store the market's deposits
   * The amount in the vault should be equal to or greater than deposits - borrows
   */
  vault: PublicKey;
  /** The encoded display name for the market e.g. SOL */
  name: Array<number>;
  historicalOracleData: types.HistoricalOracleDataFields;
  historicalIndexData: types.HistoricalIndexDataFields;
  /**
   * Revenue the protocol has collected in this markets token
   * e.g. for SOL-PERP, funds can be settled in usdc and will flow into the USDC revenue pool
   */
  revenuePool: types.PoolBalanceFields;
  /**
   * The fees collected from swaps between this market and the quote market
   * Is settled to the quote markets revenue pool
   */
  spotFeePool: types.PoolBalanceFields;
  /**
   * Details on the insurance fund covering bankruptcies in this markets token
   * Covers bankruptcies for borrows with this markets token and perps settling in this markets token
   */
  insuranceFund: types.InsuranceFundFields;
  /**
   * The total spot fees collected for this market
   * precision: QUOTE_PRECISION
   */
  totalSpotFee: BN;
  /**
   * The sum of the scaled balances for deposits across users and pool balances
   * To convert to the deposit token amount, multiply by the cumulative deposit interest
   * precision: SPOT_BALANCE_PRECISION
   */
  depositBalance: BN;
  /**
   * The sum of the scaled balances for borrows across users and pool balances
   * To convert to the borrow token amount, multiply by the cumulative borrow interest
   * precision: SPOT_BALANCE_PRECISION
   */
  borrowBalance: BN;
  /**
   * The cumulative interest earned by depositors
   * Used to calculate the deposit token amount from the deposit balance
   * precision: SPOT_CUMULATIVE_INTEREST_PRECISION
   */
  cumulativeDepositInterest: BN;
  /**
   * The cumulative interest earned by borrowers
   * Used to calculate the borrow token amount from the borrow balance
   * precision: SPOT_CUMULATIVE_INTEREST_PRECISION
   */
  cumulativeBorrowInterest: BN;
  /**
   * The total socialized loss from borrows, in the mint's token
   * precision: token mint precision
   */
  totalSocialLoss: BN;
  /**
   * The total socialized loss from borrows, in the quote market's token
   * preicision: QUOTE_PRECISION
   */
  totalQuoteSocialLoss: BN;
  /**
   * no withdraw limits/guards when deposits below this threshold
   * precision: token mint precision
   */
  withdrawGuardThreshold: BN;
  /**
   * The max amount of token deposits in this market
   * 0 if there is no limit
   * precision: token mint precision
   */
  maxTokenDeposits: BN;
  /**
   * 24hr average of deposit token amount
   * precision: token mint precision
   */
  depositTokenTwap: BN;
  /**
   * 24hr average of borrow token amount
   * precision: token mint precision
   */
  borrowTokenTwap: BN;
  /**
   * 24hr average of utilization
   * which is borrow amount over token amount
   * precision: SPOT_UTILIZATION_PRECISION
   */
  utilizationTwap: BN;
  /** Last time the cumulative deposit and borrow interest was updated */
  lastInterestTs: BN;
  /** Last time the deposit/borrow/utilization averages were updated */
  lastTwapTs: BN;
  /** The time the market is set to expire. Only set if market is in reduce only mode */
  expiryTs: BN;
  /**
   * Spot orders must be a multiple of the step size
   * precision: token mint precision
   */
  orderStepSize: BN;
  /**
   * Spot orders must be a multiple of the tick size
   * precision: PRICE_PRECISION
   */
  orderTickSize: BN;
  /**
   * The minimum order size
   * precision: token mint precision
   */
  minOrderSize: BN;
  /**
   * The maximum spot position size
   * if the limit is 0, there is no limit
   * precision: token mint precision
   */
  maxPositionSize: BN;
  /** Every spot trade has a fill record id. This is the next id to use */
  nextFillRecordId: BN;
  /** Every deposit has a deposit record id. This is the next id to use */
  nextDepositRecordId: BN;
  /**
   * The initial asset weight used to calculate a deposits contribution to a users initial total collateral
   * e.g. if the asset weight is .8, $100 of deposits contributes $80 to the users initial total collateral
   * precision: SPOT_WEIGHT_PRECISION
   */
  initialAssetWeight: number;
  /**
   * The maintenance asset weight used to calculate a deposits contribution to a users maintenance total collateral
   * e.g. if the asset weight is .9, $100 of deposits contributes $90 to the users maintenance total collateral
   * precision: SPOT_WEIGHT_PRECISION
   */
  maintenanceAssetWeight: number;
  /**
   * The initial liability weight used to calculate a borrows contribution to a users initial margin requirement
   * e.g. if the liability weight is .9, $100 of borrows contributes $90 to the users initial margin requirement
   * precision: SPOT_WEIGHT_PRECISION
   */
  initialLiabilityWeight: number;
  /**
   * The maintenance liability weight used to calculate a borrows contribution to a users maintenance margin requirement
   * e.g. if the liability weight is .8, $100 of borrows contributes $80 to the users maintenance margin requirement
   * precision: SPOT_WEIGHT_PRECISION
   */
  maintenanceLiabilityWeight: number;
  /**
   * The initial margin fraction factor. Used to increase liability weight/decrease asset weight for large positions
   * precision: MARGIN_PRECISION
   */
  imfFactor: number;
  /**
   * The fee the liquidator is paid for taking over borrow/deposit
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  liquidatorFee: number;
  /**
   * The fee the insurance fund receives from liquidation
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  ifLiquidationFee: number;
  /**
   * The optimal utilization rate for this market.
   * Used to determine the markets borrow rate
   * precision: SPOT_UTILIZATION_PRECISION
   */
  optimalUtilization: number;
  /**
   * The borrow rate for this market when the market has optimal utilization
   * precision: SPOT_RATE_PRECISION
   */
  optimalBorrowRate: number;
  /**
   * The borrow rate for this market when the market has 1000 utilization
   * precision: SPOT_RATE_PRECISION
   */
  maxBorrowRate: number;
  /** The market's token mint's decimals. To from decimals to a precision, 10^decimals */
  decimals: number;
  marketIndex: number;
  /** Whether or not spot trading is enabled */
  ordersEnabled: boolean;
  oracleSource: types.OracleSourceKind;
  status: types.MarketStatusKind;
  /** The asset tier affects how a deposit can be used as collateral and the priority for a borrow being liquidated */
  assetTier: types.AssetTierKind;
  pausedOperations: number;
  ifPausedOperations: number;
  feeAdjustment: number;
  /**
   * What fraction of max_token_deposits
   * disabled when 0, 1 => 1/10000 => .01% of max_token_deposits
   * precision: X/10000
   */
  maxTokenBorrowsFraction: number;
  /**
   * For swaps, the amount of token loaned out in the begin_swap ix
   * precision: token mint precision
   */
  flashLoanAmount: BN;
  /**
   * For swaps, the amount in the users token account in the begin_swap ix
   * Used to calculate how much of the token left the system in end_swap ix
   * precision: token mint precision
   */
  flashLoanInitialTokenAmount: BN;
  /**
   * The total fees received from swaps
   * precision: token mint precision
   */
  totalSwapFee: BN;
  /**
   * When to begin scaling down the initial asset weight
   * disabled when 0
   * precision: QUOTE_PRECISION
   */
  scaleInitialAssetWeightStart: BN;
  /**
   * The min borrow rate for this market when the market regardless of utilization
   * 1 => 1/200 => .5%
   * precision: X/200
   */
  minBorrowRate: number;
  /**
   * fuel multiplier for spot deposits
   * precision: 10
   */
  fuelBoostDeposits: number;
  /**
   * fuel multiplier for spot borrows
   * precision: 10
   */
  fuelBoostBorrows: number;
  /**
   * fuel multiplier for spot taker
   * precision: 10
   */
  fuelBoostTaker: number;
  /**
   * fuel multiplier for spot maker
   * precision: 10
   */
  fuelBoostMaker: number;
  /**
   * fuel multiplier for spot insurance stake
   * precision: 10
   */
  fuelBoostInsurance: number;
  tokenProgram: number;
  padding: Array<number>;
}

export interface SpotMarketJSON {
  /** The address of the spot market. It is a pda of the market index */
  pubkey: string;
  /** The oracle used to price the markets deposits/borrows */
  oracle: string;
  /** The token mint of the market */
  mint: string;
  /**
   * The vault used to store the market's deposits
   * The amount in the vault should be equal to or greater than deposits - borrows
   */
  vault: string;
  /** The encoded display name for the market e.g. SOL */
  name: Array<number>;
  historicalOracleData: types.HistoricalOracleDataJSON;
  historicalIndexData: types.HistoricalIndexDataJSON;
  /**
   * Revenue the protocol has collected in this markets token
   * e.g. for SOL-PERP, funds can be settled in usdc and will flow into the USDC revenue pool
   */
  revenuePool: types.PoolBalanceJSON;
  /**
   * The fees collected from swaps between this market and the quote market
   * Is settled to the quote markets revenue pool
   */
  spotFeePool: types.PoolBalanceJSON;
  /**
   * Details on the insurance fund covering bankruptcies in this markets token
   * Covers bankruptcies for borrows with this markets token and perps settling in this markets token
   */
  insuranceFund: types.InsuranceFundJSON;
  /**
   * The total spot fees collected for this market
   * precision: QUOTE_PRECISION
   */
  totalSpotFee: string;
  /**
   * The sum of the scaled balances for deposits across users and pool balances
   * To convert to the deposit token amount, multiply by the cumulative deposit interest
   * precision: SPOT_BALANCE_PRECISION
   */
  depositBalance: string;
  /**
   * The sum of the scaled balances for borrows across users and pool balances
   * To convert to the borrow token amount, multiply by the cumulative borrow interest
   * precision: SPOT_BALANCE_PRECISION
   */
  borrowBalance: string;
  /**
   * The cumulative interest earned by depositors
   * Used to calculate the deposit token amount from the deposit balance
   * precision: SPOT_CUMULATIVE_INTEREST_PRECISION
   */
  cumulativeDepositInterest: string;
  /**
   * The cumulative interest earned by borrowers
   * Used to calculate the borrow token amount from the borrow balance
   * precision: SPOT_CUMULATIVE_INTEREST_PRECISION
   */
  cumulativeBorrowInterest: string;
  /**
   * The total socialized loss from borrows, in the mint's token
   * precision: token mint precision
   */
  totalSocialLoss: string;
  /**
   * The total socialized loss from borrows, in the quote market's token
   * preicision: QUOTE_PRECISION
   */
  totalQuoteSocialLoss: string;
  /**
   * no withdraw limits/guards when deposits below this threshold
   * precision: token mint precision
   */
  withdrawGuardThreshold: string;
  /**
   * The max amount of token deposits in this market
   * 0 if there is no limit
   * precision: token mint precision
   */
  maxTokenDeposits: string;
  /**
   * 24hr average of deposit token amount
   * precision: token mint precision
   */
  depositTokenTwap: string;
  /**
   * 24hr average of borrow token amount
   * precision: token mint precision
   */
  borrowTokenTwap: string;
  /**
   * 24hr average of utilization
   * which is borrow amount over token amount
   * precision: SPOT_UTILIZATION_PRECISION
   */
  utilizationTwap: string;
  /** Last time the cumulative deposit and borrow interest was updated */
  lastInterestTs: string;
  /** Last time the deposit/borrow/utilization averages were updated */
  lastTwapTs: string;
  /** The time the market is set to expire. Only set if market is in reduce only mode */
  expiryTs: string;
  /**
   * Spot orders must be a multiple of the step size
   * precision: token mint precision
   */
  orderStepSize: string;
  /**
   * Spot orders must be a multiple of the tick size
   * precision: PRICE_PRECISION
   */
  orderTickSize: string;
  /**
   * The minimum order size
   * precision: token mint precision
   */
  minOrderSize: string;
  /**
   * The maximum spot position size
   * if the limit is 0, there is no limit
   * precision: token mint precision
   */
  maxPositionSize: string;
  /** Every spot trade has a fill record id. This is the next id to use */
  nextFillRecordId: string;
  /** Every deposit has a deposit record id. This is the next id to use */
  nextDepositRecordId: string;
  /**
   * The initial asset weight used to calculate a deposits contribution to a users initial total collateral
   * e.g. if the asset weight is .8, $100 of deposits contributes $80 to the users initial total collateral
   * precision: SPOT_WEIGHT_PRECISION
   */
  initialAssetWeight: number;
  /**
   * The maintenance asset weight used to calculate a deposits contribution to a users maintenance total collateral
   * e.g. if the asset weight is .9, $100 of deposits contributes $90 to the users maintenance total collateral
   * precision: SPOT_WEIGHT_PRECISION
   */
  maintenanceAssetWeight: number;
  /**
   * The initial liability weight used to calculate a borrows contribution to a users initial margin requirement
   * e.g. if the liability weight is .9, $100 of borrows contributes $90 to the users initial margin requirement
   * precision: SPOT_WEIGHT_PRECISION
   */
  initialLiabilityWeight: number;
  /**
   * The maintenance liability weight used to calculate a borrows contribution to a users maintenance margin requirement
   * e.g. if the liability weight is .8, $100 of borrows contributes $80 to the users maintenance margin requirement
   * precision: SPOT_WEIGHT_PRECISION
   */
  maintenanceLiabilityWeight: number;
  /**
   * The initial margin fraction factor. Used to increase liability weight/decrease asset weight for large positions
   * precision: MARGIN_PRECISION
   */
  imfFactor: number;
  /**
   * The fee the liquidator is paid for taking over borrow/deposit
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  liquidatorFee: number;
  /**
   * The fee the insurance fund receives from liquidation
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  ifLiquidationFee: number;
  /**
   * The optimal utilization rate for this market.
   * Used to determine the markets borrow rate
   * precision: SPOT_UTILIZATION_PRECISION
   */
  optimalUtilization: number;
  /**
   * The borrow rate for this market when the market has optimal utilization
   * precision: SPOT_RATE_PRECISION
   */
  optimalBorrowRate: number;
  /**
   * The borrow rate for this market when the market has 1000 utilization
   * precision: SPOT_RATE_PRECISION
   */
  maxBorrowRate: number;
  /** The market's token mint's decimals. To from decimals to a precision, 10^decimals */
  decimals: number;
  marketIndex: number;
  /** Whether or not spot trading is enabled */
  ordersEnabled: boolean;
  oracleSource: types.OracleSourceJSON;
  status: types.MarketStatusJSON;
  /** The asset tier affects how a deposit can be used as collateral and the priority for a borrow being liquidated */
  assetTier: types.AssetTierJSON;
  pausedOperations: number;
  ifPausedOperations: number;
  feeAdjustment: number;
  /**
   * What fraction of max_token_deposits
   * disabled when 0, 1 => 1/10000 => .01% of max_token_deposits
   * precision: X/10000
   */
  maxTokenBorrowsFraction: number;
  /**
   * For swaps, the amount of token loaned out in the begin_swap ix
   * precision: token mint precision
   */
  flashLoanAmount: string;
  /**
   * For swaps, the amount in the users token account in the begin_swap ix
   * Used to calculate how much of the token left the system in end_swap ix
   * precision: token mint precision
   */
  flashLoanInitialTokenAmount: string;
  /**
   * The total fees received from swaps
   * precision: token mint precision
   */
  totalSwapFee: string;
  /**
   * When to begin scaling down the initial asset weight
   * disabled when 0
   * precision: QUOTE_PRECISION
   */
  scaleInitialAssetWeightStart: string;
  /**
   * The min borrow rate for this market when the market regardless of utilization
   * 1 => 1/200 => .5%
   * precision: X/200
   */
  minBorrowRate: number;
  /**
   * fuel multiplier for spot deposits
   * precision: 10
   */
  fuelBoostDeposits: number;
  /**
   * fuel multiplier for spot borrows
   * precision: 10
   */
  fuelBoostBorrows: number;
  /**
   * fuel multiplier for spot taker
   * precision: 10
   */
  fuelBoostTaker: number;
  /**
   * fuel multiplier for spot maker
   * precision: 10
   */
  fuelBoostMaker: number;
  /**
   * fuel multiplier for spot insurance stake
   * precision: 10
   */
  fuelBoostInsurance: number;
  tokenProgram: number;
  padding: Array<number>;
}

export class SpotMarket {
  /** The address of the spot market. It is a pda of the market index */
  readonly pubkey: PublicKey;
  /** The oracle used to price the markets deposits/borrows */
  readonly oracle: PublicKey;
  /** The token mint of the market */
  readonly mint: PublicKey;
  /**
   * The vault used to store the market's deposits
   * The amount in the vault should be equal to or greater than deposits - borrows
   */
  readonly vault: PublicKey;
  /** The encoded display name for the market e.g. SOL */
  readonly name: Array<number>;
  readonly historicalOracleData: types.HistoricalOracleData;
  readonly historicalIndexData: types.HistoricalIndexData;
  /**
   * Revenue the protocol has collected in this markets token
   * e.g. for SOL-PERP, funds can be settled in usdc and will flow into the USDC revenue pool
   */
  readonly revenuePool: types.PoolBalance;
  /**
   * The fees collected from swaps between this market and the quote market
   * Is settled to the quote markets revenue pool
   */
  readonly spotFeePool: types.PoolBalance;
  /**
   * Details on the insurance fund covering bankruptcies in this markets token
   * Covers bankruptcies for borrows with this markets token and perps settling in this markets token
   */
  readonly insuranceFund: types.InsuranceFund;
  /**
   * The total spot fees collected for this market
   * precision: QUOTE_PRECISION
   */
  readonly totalSpotFee: BN;
  /**
   * The sum of the scaled balances for deposits across users and pool balances
   * To convert to the deposit token amount, multiply by the cumulative deposit interest
   * precision: SPOT_BALANCE_PRECISION
   */
  readonly depositBalance: BN;
  /**
   * The sum of the scaled balances for borrows across users and pool balances
   * To convert to the borrow token amount, multiply by the cumulative borrow interest
   * precision: SPOT_BALANCE_PRECISION
   */
  readonly borrowBalance: BN;
  /**
   * The cumulative interest earned by depositors
   * Used to calculate the deposit token amount from the deposit balance
   * precision: SPOT_CUMULATIVE_INTEREST_PRECISION
   */
  readonly cumulativeDepositInterest: BN;
  /**
   * The cumulative interest earned by borrowers
   * Used to calculate the borrow token amount from the borrow balance
   * precision: SPOT_CUMULATIVE_INTEREST_PRECISION
   */
  readonly cumulativeBorrowInterest: BN;
  /**
   * The total socialized loss from borrows, in the mint's token
   * precision: token mint precision
   */
  readonly totalSocialLoss: BN;
  /**
   * The total socialized loss from borrows, in the quote market's token
   * preicision: QUOTE_PRECISION
   */
  readonly totalQuoteSocialLoss: BN;
  /**
   * no withdraw limits/guards when deposits below this threshold
   * precision: token mint precision
   */
  readonly withdrawGuardThreshold: BN;
  /**
   * The max amount of token deposits in this market
   * 0 if there is no limit
   * precision: token mint precision
   */
  readonly maxTokenDeposits: BN;
  /**
   * 24hr average of deposit token amount
   * precision: token mint precision
   */
  readonly depositTokenTwap: BN;
  /**
   * 24hr average of borrow token amount
   * precision: token mint precision
   */
  readonly borrowTokenTwap: BN;
  /**
   * 24hr average of utilization
   * which is borrow amount over token amount
   * precision: SPOT_UTILIZATION_PRECISION
   */
  readonly utilizationTwap: BN;
  /** Last time the cumulative deposit and borrow interest was updated */
  readonly lastInterestTs: BN;
  /** Last time the deposit/borrow/utilization averages were updated */
  readonly lastTwapTs: BN;
  /** The time the market is set to expire. Only set if market is in reduce only mode */
  readonly expiryTs: BN;
  /**
   * Spot orders must be a multiple of the step size
   * precision: token mint precision
   */
  readonly orderStepSize: BN;
  /**
   * Spot orders must be a multiple of the tick size
   * precision: PRICE_PRECISION
   */
  readonly orderTickSize: BN;
  /**
   * The minimum order size
   * precision: token mint precision
   */
  readonly minOrderSize: BN;
  /**
   * The maximum spot position size
   * if the limit is 0, there is no limit
   * precision: token mint precision
   */
  readonly maxPositionSize: BN;
  /** Every spot trade has a fill record id. This is the next id to use */
  readonly nextFillRecordId: BN;
  /** Every deposit has a deposit record id. This is the next id to use */
  readonly nextDepositRecordId: BN;
  /**
   * The initial asset weight used to calculate a deposits contribution to a users initial total collateral
   * e.g. if the asset weight is .8, $100 of deposits contributes $80 to the users initial total collateral
   * precision: SPOT_WEIGHT_PRECISION
   */
  readonly initialAssetWeight: number;
  /**
   * The maintenance asset weight used to calculate a deposits contribution to a users maintenance total collateral
   * e.g. if the asset weight is .9, $100 of deposits contributes $90 to the users maintenance total collateral
   * precision: SPOT_WEIGHT_PRECISION
   */
  readonly maintenanceAssetWeight: number;
  /**
   * The initial liability weight used to calculate a borrows contribution to a users initial margin requirement
   * e.g. if the liability weight is .9, $100 of borrows contributes $90 to the users initial margin requirement
   * precision: SPOT_WEIGHT_PRECISION
   */
  readonly initialLiabilityWeight: number;
  /**
   * The maintenance liability weight used to calculate a borrows contribution to a users maintenance margin requirement
   * e.g. if the liability weight is .8, $100 of borrows contributes $80 to the users maintenance margin requirement
   * precision: SPOT_WEIGHT_PRECISION
   */
  readonly maintenanceLiabilityWeight: number;
  /**
   * The initial margin fraction factor. Used to increase liability weight/decrease asset weight for large positions
   * precision: MARGIN_PRECISION
   */
  readonly imfFactor: number;
  /**
   * The fee the liquidator is paid for taking over borrow/deposit
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  readonly liquidatorFee: number;
  /**
   * The fee the insurance fund receives from liquidation
   * precision: LIQUIDATOR_FEE_PRECISION
   */
  readonly ifLiquidationFee: number;
  /**
   * The optimal utilization rate for this market.
   * Used to determine the markets borrow rate
   * precision: SPOT_UTILIZATION_PRECISION
   */
  readonly optimalUtilization: number;
  /**
   * The borrow rate for this market when the market has optimal utilization
   * precision: SPOT_RATE_PRECISION
   */
  readonly optimalBorrowRate: number;
  /**
   * The borrow rate for this market when the market has 1000 utilization
   * precision: SPOT_RATE_PRECISION
   */
  readonly maxBorrowRate: number;
  /** The market's token mint's decimals. To from decimals to a precision, 10^decimals */
  readonly decimals: number;
  readonly marketIndex: number;
  /** Whether or not spot trading is enabled */
  readonly ordersEnabled: boolean;
  readonly oracleSource: types.OracleSourceKind;
  readonly status: types.MarketStatusKind;
  /** The asset tier affects how a deposit can be used as collateral and the priority for a borrow being liquidated */
  readonly assetTier: types.AssetTierKind;
  readonly pausedOperations: number;
  readonly ifPausedOperations: number;
  readonly feeAdjustment: number;
  /**
   * What fraction of max_token_deposits
   * disabled when 0, 1 => 1/10000 => .01% of max_token_deposits
   * precision: X/10000
   */
  readonly maxTokenBorrowsFraction: number;
  /**
   * For swaps, the amount of token loaned out in the begin_swap ix
   * precision: token mint precision
   */
  readonly flashLoanAmount: BN;
  /**
   * For swaps, the amount in the users token account in the begin_swap ix
   * Used to calculate how much of the token left the system in end_swap ix
   * precision: token mint precision
   */
  readonly flashLoanInitialTokenAmount: BN;
  /**
   * The total fees received from swaps
   * precision: token mint precision
   */
  readonly totalSwapFee: BN;
  /**
   * When to begin scaling down the initial asset weight
   * disabled when 0
   * precision: QUOTE_PRECISION
   */
  readonly scaleInitialAssetWeightStart: BN;
  /**
   * The min borrow rate for this market when the market regardless of utilization
   * 1 => 1/200 => .5%
   * precision: X/200
   */
  readonly minBorrowRate: number;
  /**
   * fuel multiplier for spot deposits
   * precision: 10
   */
  readonly fuelBoostDeposits: number;
  /**
   * fuel multiplier for spot borrows
   * precision: 10
   */
  readonly fuelBoostBorrows: number;
  /**
   * fuel multiplier for spot taker
   * precision: 10
   */
  readonly fuelBoostTaker: number;
  /**
   * fuel multiplier for spot maker
   * precision: 10
   */
  readonly fuelBoostMaker: number;
  /**
   * fuel multiplier for spot insurance stake
   * precision: 10
   */
  readonly fuelBoostInsurance: number;
  readonly tokenProgram: number;
  readonly padding: Array<number>;

  static readonly discriminator = Buffer.from([
    100, 177, 8, 107, 168, 65, 65, 39,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("pubkey"),
    borsh.publicKey("oracle"),
    borsh.publicKey("mint"),
    borsh.publicKey("vault"),
    borsh.array(borsh.u8(), 32, "name"),
    types.HistoricalOracleData.layout("historicalOracleData"),
    types.HistoricalIndexData.layout("historicalIndexData"),
    types.PoolBalance.layout("revenuePool"),
    types.PoolBalance.layout("spotFeePool"),
    types.InsuranceFund.layout("insuranceFund"),
    borsh.u128("totalSpotFee"),
    borsh.u128("depositBalance"),
    borsh.u128("borrowBalance"),
    borsh.u128("cumulativeDepositInterest"),
    borsh.u128("cumulativeBorrowInterest"),
    borsh.u128("totalSocialLoss"),
    borsh.u128("totalQuoteSocialLoss"),
    borsh.u64("withdrawGuardThreshold"),
    borsh.u64("maxTokenDeposits"),
    borsh.u64("depositTokenTwap"),
    borsh.u64("borrowTokenTwap"),
    borsh.u64("utilizationTwap"),
    borsh.u64("lastInterestTs"),
    borsh.u64("lastTwapTs"),
    borsh.i64("expiryTs"),
    borsh.u64("orderStepSize"),
    borsh.u64("orderTickSize"),
    borsh.u64("minOrderSize"),
    borsh.u64("maxPositionSize"),
    borsh.u64("nextFillRecordId"),
    borsh.u64("nextDepositRecordId"),
    borsh.u32("initialAssetWeight"),
    borsh.u32("maintenanceAssetWeight"),
    borsh.u32("initialLiabilityWeight"),
    borsh.u32("maintenanceLiabilityWeight"),
    borsh.u32("imfFactor"),
    borsh.u32("liquidatorFee"),
    borsh.u32("ifLiquidationFee"),
    borsh.u32("optimalUtilization"),
    borsh.u32("optimalBorrowRate"),
    borsh.u32("maxBorrowRate"),
    borsh.u32("decimals"),
    borsh.u16("marketIndex"),
    borsh.bool("ordersEnabled"),
    types.OracleSource.layout("oracleSource"),
    types.MarketStatus.layout("status"),
    types.AssetTier.layout("assetTier"),
    borsh.u8("pausedOperations"),
    borsh.u8("ifPausedOperations"),
    borsh.i16("feeAdjustment"),
    borsh.u16("maxTokenBorrowsFraction"),
    borsh.u64("flashLoanAmount"),
    borsh.u64("flashLoanInitialTokenAmount"),
    borsh.u64("totalSwapFee"),
    borsh.u64("scaleInitialAssetWeightStart"),
    borsh.u8("minBorrowRate"),
    borsh.u8("fuelBoostDeposits"),
    borsh.u8("fuelBoostBorrows"),
    borsh.u8("fuelBoostTaker"),
    borsh.u8("fuelBoostMaker"),
    borsh.u8("fuelBoostInsurance"),
    borsh.u8("tokenProgram"),
    borsh.array(borsh.u8(), 41, "padding"),
  ]);

  constructor(fields: SpotMarketFields) {
    this.pubkey = fields.pubkey;
    this.oracle = fields.oracle;
    this.mint = fields.mint;
    this.vault = fields.vault;
    this.name = fields.name;
    this.historicalOracleData = new types.HistoricalOracleData({
      ...fields.historicalOracleData,
    });
    this.historicalIndexData = new types.HistoricalIndexData({
      ...fields.historicalIndexData,
    });
    this.revenuePool = new types.PoolBalance({ ...fields.revenuePool });
    this.spotFeePool = new types.PoolBalance({ ...fields.spotFeePool });
    this.insuranceFund = new types.InsuranceFund({ ...fields.insuranceFund });
    this.totalSpotFee = fields.totalSpotFee;
    this.depositBalance = fields.depositBalance;
    this.borrowBalance = fields.borrowBalance;
    this.cumulativeDepositInterest = fields.cumulativeDepositInterest;
    this.cumulativeBorrowInterest = fields.cumulativeBorrowInterest;
    this.totalSocialLoss = fields.totalSocialLoss;
    this.totalQuoteSocialLoss = fields.totalQuoteSocialLoss;
    this.withdrawGuardThreshold = fields.withdrawGuardThreshold;
    this.maxTokenDeposits = fields.maxTokenDeposits;
    this.depositTokenTwap = fields.depositTokenTwap;
    this.borrowTokenTwap = fields.borrowTokenTwap;
    this.utilizationTwap = fields.utilizationTwap;
    this.lastInterestTs = fields.lastInterestTs;
    this.lastTwapTs = fields.lastTwapTs;
    this.expiryTs = fields.expiryTs;
    this.orderStepSize = fields.orderStepSize;
    this.orderTickSize = fields.orderTickSize;
    this.minOrderSize = fields.minOrderSize;
    this.maxPositionSize = fields.maxPositionSize;
    this.nextFillRecordId = fields.nextFillRecordId;
    this.nextDepositRecordId = fields.nextDepositRecordId;
    this.initialAssetWeight = fields.initialAssetWeight;
    this.maintenanceAssetWeight = fields.maintenanceAssetWeight;
    this.initialLiabilityWeight = fields.initialLiabilityWeight;
    this.maintenanceLiabilityWeight = fields.maintenanceLiabilityWeight;
    this.imfFactor = fields.imfFactor;
    this.liquidatorFee = fields.liquidatorFee;
    this.ifLiquidationFee = fields.ifLiquidationFee;
    this.optimalUtilization = fields.optimalUtilization;
    this.optimalBorrowRate = fields.optimalBorrowRate;
    this.maxBorrowRate = fields.maxBorrowRate;
    this.decimals = fields.decimals;
    this.marketIndex = fields.marketIndex;
    this.ordersEnabled = fields.ordersEnabled;
    this.oracleSource = fields.oracleSource;
    this.status = fields.status;
    this.assetTier = fields.assetTier;
    this.pausedOperations = fields.pausedOperations;
    this.ifPausedOperations = fields.ifPausedOperations;
    this.feeAdjustment = fields.feeAdjustment;
    this.maxTokenBorrowsFraction = fields.maxTokenBorrowsFraction;
    this.flashLoanAmount = fields.flashLoanAmount;
    this.flashLoanInitialTokenAmount = fields.flashLoanInitialTokenAmount;
    this.totalSwapFee = fields.totalSwapFee;
    this.scaleInitialAssetWeightStart = fields.scaleInitialAssetWeightStart;
    this.minBorrowRate = fields.minBorrowRate;
    this.fuelBoostDeposits = fields.fuelBoostDeposits;
    this.fuelBoostBorrows = fields.fuelBoostBorrows;
    this.fuelBoostTaker = fields.fuelBoostTaker;
    this.fuelBoostMaker = fields.fuelBoostMaker;
    this.fuelBoostInsurance = fields.fuelBoostInsurance;
    this.tokenProgram = fields.tokenProgram;
    this.padding = fields.padding;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<SpotMarket | null> {
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
  ): Promise<Array<SpotMarket | null>> {
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

  static decode(data: Buffer): SpotMarket {
    if (!data.slice(0, 8).equals(SpotMarket.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = SpotMarket.layout.decode(data.slice(8));

    return new SpotMarket({
      pubkey: dec.pubkey,
      oracle: dec.oracle,
      mint: dec.mint,
      vault: dec.vault,
      name: dec.name,
      historicalOracleData: types.HistoricalOracleData.fromDecoded(
        dec.historicalOracleData
      ),
      historicalIndexData: types.HistoricalIndexData.fromDecoded(
        dec.historicalIndexData
      ),
      revenuePool: types.PoolBalance.fromDecoded(dec.revenuePool),
      spotFeePool: types.PoolBalance.fromDecoded(dec.spotFeePool),
      insuranceFund: types.InsuranceFund.fromDecoded(dec.insuranceFund),
      totalSpotFee: dec.totalSpotFee,
      depositBalance: dec.depositBalance,
      borrowBalance: dec.borrowBalance,
      cumulativeDepositInterest: dec.cumulativeDepositInterest,
      cumulativeBorrowInterest: dec.cumulativeBorrowInterest,
      totalSocialLoss: dec.totalSocialLoss,
      totalQuoteSocialLoss: dec.totalQuoteSocialLoss,
      withdrawGuardThreshold: dec.withdrawGuardThreshold,
      maxTokenDeposits: dec.maxTokenDeposits,
      depositTokenTwap: dec.depositTokenTwap,
      borrowTokenTwap: dec.borrowTokenTwap,
      utilizationTwap: dec.utilizationTwap,
      lastInterestTs: dec.lastInterestTs,
      lastTwapTs: dec.lastTwapTs,
      expiryTs: dec.expiryTs,
      orderStepSize: dec.orderStepSize,
      orderTickSize: dec.orderTickSize,
      minOrderSize: dec.minOrderSize,
      maxPositionSize: dec.maxPositionSize,
      nextFillRecordId: dec.nextFillRecordId,
      nextDepositRecordId: dec.nextDepositRecordId,
      initialAssetWeight: dec.initialAssetWeight,
      maintenanceAssetWeight: dec.maintenanceAssetWeight,
      initialLiabilityWeight: dec.initialLiabilityWeight,
      maintenanceLiabilityWeight: dec.maintenanceLiabilityWeight,
      imfFactor: dec.imfFactor,
      liquidatorFee: dec.liquidatorFee,
      ifLiquidationFee: dec.ifLiquidationFee,
      optimalUtilization: dec.optimalUtilization,
      optimalBorrowRate: dec.optimalBorrowRate,
      maxBorrowRate: dec.maxBorrowRate,
      decimals: dec.decimals,
      marketIndex: dec.marketIndex,
      ordersEnabled: dec.ordersEnabled,
      oracleSource: types.OracleSource.fromDecoded(dec.oracleSource),
      status: types.MarketStatus.fromDecoded(dec.status),
      assetTier: types.AssetTier.fromDecoded(dec.assetTier),
      pausedOperations: dec.pausedOperations,
      ifPausedOperations: dec.ifPausedOperations,
      feeAdjustment: dec.feeAdjustment,
      maxTokenBorrowsFraction: dec.maxTokenBorrowsFraction,
      flashLoanAmount: dec.flashLoanAmount,
      flashLoanInitialTokenAmount: dec.flashLoanInitialTokenAmount,
      totalSwapFee: dec.totalSwapFee,
      scaleInitialAssetWeightStart: dec.scaleInitialAssetWeightStart,
      minBorrowRate: dec.minBorrowRate,
      fuelBoostDeposits: dec.fuelBoostDeposits,
      fuelBoostBorrows: dec.fuelBoostBorrows,
      fuelBoostTaker: dec.fuelBoostTaker,
      fuelBoostMaker: dec.fuelBoostMaker,
      fuelBoostInsurance: dec.fuelBoostInsurance,
      tokenProgram: dec.tokenProgram,
      padding: dec.padding,
    });
  }

  toJSON(): SpotMarketJSON {
    return {
      pubkey: this.pubkey.toString(),
      oracle: this.oracle.toString(),
      mint: this.mint.toString(),
      vault: this.vault.toString(),
      name: this.name,
      historicalOracleData: this.historicalOracleData.toJSON(),
      historicalIndexData: this.historicalIndexData.toJSON(),
      revenuePool: this.revenuePool.toJSON(),
      spotFeePool: this.spotFeePool.toJSON(),
      insuranceFund: this.insuranceFund.toJSON(),
      totalSpotFee: this.totalSpotFee.toString(),
      depositBalance: this.depositBalance.toString(),
      borrowBalance: this.borrowBalance.toString(),
      cumulativeDepositInterest: this.cumulativeDepositInterest.toString(),
      cumulativeBorrowInterest: this.cumulativeBorrowInterest.toString(),
      totalSocialLoss: this.totalSocialLoss.toString(),
      totalQuoteSocialLoss: this.totalQuoteSocialLoss.toString(),
      withdrawGuardThreshold: this.withdrawGuardThreshold.toString(),
      maxTokenDeposits: this.maxTokenDeposits.toString(),
      depositTokenTwap: this.depositTokenTwap.toString(),
      borrowTokenTwap: this.borrowTokenTwap.toString(),
      utilizationTwap: this.utilizationTwap.toString(),
      lastInterestTs: this.lastInterestTs.toString(),
      lastTwapTs: this.lastTwapTs.toString(),
      expiryTs: this.expiryTs.toString(),
      orderStepSize: this.orderStepSize.toString(),
      orderTickSize: this.orderTickSize.toString(),
      minOrderSize: this.minOrderSize.toString(),
      maxPositionSize: this.maxPositionSize.toString(),
      nextFillRecordId: this.nextFillRecordId.toString(),
      nextDepositRecordId: this.nextDepositRecordId.toString(),
      initialAssetWeight: this.initialAssetWeight,
      maintenanceAssetWeight: this.maintenanceAssetWeight,
      initialLiabilityWeight: this.initialLiabilityWeight,
      maintenanceLiabilityWeight: this.maintenanceLiabilityWeight,
      imfFactor: this.imfFactor,
      liquidatorFee: this.liquidatorFee,
      ifLiquidationFee: this.ifLiquidationFee,
      optimalUtilization: this.optimalUtilization,
      optimalBorrowRate: this.optimalBorrowRate,
      maxBorrowRate: this.maxBorrowRate,
      decimals: this.decimals,
      marketIndex: this.marketIndex,
      ordersEnabled: this.ordersEnabled,
      oracleSource: this.oracleSource.toJSON(),
      status: this.status.toJSON(),
      assetTier: this.assetTier.toJSON(),
      pausedOperations: this.pausedOperations,
      ifPausedOperations: this.ifPausedOperations,
      feeAdjustment: this.feeAdjustment,
      maxTokenBorrowsFraction: this.maxTokenBorrowsFraction,
      flashLoanAmount: this.flashLoanAmount.toString(),
      flashLoanInitialTokenAmount: this.flashLoanInitialTokenAmount.toString(),
      totalSwapFee: this.totalSwapFee.toString(),
      scaleInitialAssetWeightStart:
        this.scaleInitialAssetWeightStart.toString(),
      minBorrowRate: this.minBorrowRate,
      fuelBoostDeposits: this.fuelBoostDeposits,
      fuelBoostBorrows: this.fuelBoostBorrows,
      fuelBoostTaker: this.fuelBoostTaker,
      fuelBoostMaker: this.fuelBoostMaker,
      fuelBoostInsurance: this.fuelBoostInsurance,
      tokenProgram: this.tokenProgram,
      padding: this.padding,
    };
  }

  static fromJSON(obj: SpotMarketJSON): SpotMarket {
    return new SpotMarket({
      pubkey: new PublicKey(obj.pubkey),
      oracle: new PublicKey(obj.oracle),
      mint: new PublicKey(obj.mint),
      vault: new PublicKey(obj.vault),
      name: obj.name,
      historicalOracleData: types.HistoricalOracleData.fromJSON(
        obj.historicalOracleData
      ),
      historicalIndexData: types.HistoricalIndexData.fromJSON(
        obj.historicalIndexData
      ),
      revenuePool: types.PoolBalance.fromJSON(obj.revenuePool),
      spotFeePool: types.PoolBalance.fromJSON(obj.spotFeePool),
      insuranceFund: types.InsuranceFund.fromJSON(obj.insuranceFund),
      totalSpotFee: new BN(obj.totalSpotFee),
      depositBalance: new BN(obj.depositBalance),
      borrowBalance: new BN(obj.borrowBalance),
      cumulativeDepositInterest: new BN(obj.cumulativeDepositInterest),
      cumulativeBorrowInterest: new BN(obj.cumulativeBorrowInterest),
      totalSocialLoss: new BN(obj.totalSocialLoss),
      totalQuoteSocialLoss: new BN(obj.totalQuoteSocialLoss),
      withdrawGuardThreshold: new BN(obj.withdrawGuardThreshold),
      maxTokenDeposits: new BN(obj.maxTokenDeposits),
      depositTokenTwap: new BN(obj.depositTokenTwap),
      borrowTokenTwap: new BN(obj.borrowTokenTwap),
      utilizationTwap: new BN(obj.utilizationTwap),
      lastInterestTs: new BN(obj.lastInterestTs),
      lastTwapTs: new BN(obj.lastTwapTs),
      expiryTs: new BN(obj.expiryTs),
      orderStepSize: new BN(obj.orderStepSize),
      orderTickSize: new BN(obj.orderTickSize),
      minOrderSize: new BN(obj.minOrderSize),
      maxPositionSize: new BN(obj.maxPositionSize),
      nextFillRecordId: new BN(obj.nextFillRecordId),
      nextDepositRecordId: new BN(obj.nextDepositRecordId),
      initialAssetWeight: obj.initialAssetWeight,
      maintenanceAssetWeight: obj.maintenanceAssetWeight,
      initialLiabilityWeight: obj.initialLiabilityWeight,
      maintenanceLiabilityWeight: obj.maintenanceLiabilityWeight,
      imfFactor: obj.imfFactor,
      liquidatorFee: obj.liquidatorFee,
      ifLiquidationFee: obj.ifLiquidationFee,
      optimalUtilization: obj.optimalUtilization,
      optimalBorrowRate: obj.optimalBorrowRate,
      maxBorrowRate: obj.maxBorrowRate,
      decimals: obj.decimals,
      marketIndex: obj.marketIndex,
      ordersEnabled: obj.ordersEnabled,
      oracleSource: types.OracleSource.fromJSON(obj.oracleSource),
      status: types.MarketStatus.fromJSON(obj.status),
      assetTier: types.AssetTier.fromJSON(obj.assetTier),
      pausedOperations: obj.pausedOperations,
      ifPausedOperations: obj.ifPausedOperations,
      feeAdjustment: obj.feeAdjustment,
      maxTokenBorrowsFraction: obj.maxTokenBorrowsFraction,
      flashLoanAmount: new BN(obj.flashLoanAmount),
      flashLoanInitialTokenAmount: new BN(obj.flashLoanInitialTokenAmount),
      totalSwapFee: new BN(obj.totalSwapFee),
      scaleInitialAssetWeightStart: new BN(obj.scaleInitialAssetWeightStart),
      minBorrowRate: obj.minBorrowRate,
      fuelBoostDeposits: obj.fuelBoostDeposits,
      fuelBoostBorrows: obj.fuelBoostBorrows,
      fuelBoostTaker: obj.fuelBoostTaker,
      fuelBoostMaker: obj.fuelBoostMaker,
      fuelBoostInsurance: obj.fuelBoostInsurance,
      tokenProgram: obj.tokenProgram,
      padding: obj.padding,
    });
  }
}
