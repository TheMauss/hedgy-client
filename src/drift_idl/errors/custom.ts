export type CustomError =
  | InvalidSpotMarketAuthority
  | InvalidInsuranceFundAuthority
  | InsufficientDeposit
  | InsufficientCollateral
  | SufficientCollateral
  | MaxNumberOfPositions
  | AdminControlsPricesDisabled
  | MarketDelisted
  | MarketIndexAlreadyInitialized
  | UserAccountAndUserPositionsAccountMismatch
  | UserHasNoPositionInMarket
  | InvalidInitialPeg
  | InvalidRepegRedundant
  | InvalidRepegDirection
  | InvalidRepegProfitability
  | SlippageOutsideLimit
  | OrderSizeTooSmall
  | InvalidUpdateK
  | AdminWithdrawTooLarge
  | MathError
  | BnConversionError
  | ClockUnavailable
  | UnableToLoadOracle
  | PriceBandsBreached
  | ExchangePaused
  | InvalidWhitelistToken
  | WhitelistTokenNotFound
  | InvalidDiscountToken
  | DiscountTokenNotFound
  | ReferrerNotFound
  | ReferrerStatsNotFound
  | ReferrerMustBeWritable
  | ReferrerStatsMustBeWritable
  | ReferrerAndReferrerStatsAuthorityUnequal
  | InvalidReferrer
  | InvalidOracle
  | OracleNotFound
  | LiquidationsBlockedByOracle
  | MaxDeposit
  | CantDeleteUserWithCollateral
  | InvalidFundingProfitability
  | CastingFailure
  | InvalidOrder
  | InvalidOrderMaxTs
  | InvalidOrderMarketType
  | InvalidOrderForInitialMarginReq
  | InvalidOrderNotRiskReducing
  | InvalidOrderSizeTooSmall
  | InvalidOrderNotStepSizeMultiple
  | InvalidOrderBaseQuoteAsset
  | InvalidOrderIOC
  | InvalidOrderPostOnly
  | InvalidOrderIOCPostOnly
  | InvalidOrderTrigger
  | InvalidOrderAuction
  | InvalidOrderOracleOffset
  | InvalidOrderMinOrderSize
  | PlacePostOnlyLimitFailure
  | UserHasNoOrder
  | OrderAmountTooSmall
  | MaxNumberOfOrders
  | OrderDoesNotExist
  | OrderNotOpen
  | FillOrderDidNotUpdateState
  | ReduceOnlyOrderIncreasedRisk
  | UnableToLoadAccountLoader
  | TradeSizeTooLarge
  | UserCantReferThemselves
  | DidNotReceiveExpectedReferrer
  | CouldNotDeserializeReferrer
  | CouldNotDeserializeReferrerStats
  | UserOrderIdAlreadyInUse
  | NoPositionsLiquidatable
  | InvalidMarginRatio
  | CantCancelPostOnlyOrder
  | InvalidOracleOffset
  | CantExpireOrders
  | CouldNotLoadMarketData
  | PerpMarketNotFound
  | InvalidMarketAccount
  | UnableToLoadPerpMarketAccount
  | MarketWrongMutability
  | UnableToCastUnixTime
  | CouldNotFindSpotPosition
  | NoSpotPositionAvailable
  | InvalidSpotMarketInitialization
  | CouldNotLoadSpotMarketData
  | SpotMarketNotFound
  | InvalidSpotMarketAccount
  | UnableToLoadSpotMarketAccount
  | SpotMarketWrongMutability
  | SpotMarketInterestNotUpToDate
  | SpotMarketInsufficientDeposits
  | UserMustSettleTheirOwnPositiveUnsettledPNL
  | CantUpdatePoolBalanceType
  | InsufficientCollateralForSettlingPNL
  | AMMNotUpdatedInSameSlot
  | AuctionNotComplete
  | MakerNotFound
  | MakerStatsNotFound
  | MakerMustBeWritable
  | MakerStatsMustBeWritable
  | MakerOrderNotFound
  | CouldNotDeserializeMaker
  | CouldNotDeserializeMakerStats
  | AuctionPriceDoesNotSatisfyMaker
  | MakerCantFulfillOwnOrder
  | MakerOrderMustBePostOnly
  | CantMatchTwoPostOnlys
  | OrderBreachesOraclePriceLimits
  | OrderMustBeTriggeredFirst
  | OrderNotTriggerable
  | OrderDidNotSatisfyTriggerCondition
  | PositionAlreadyBeingLiquidated
  | PositionDoesntHaveOpenPositionOrOrders
  | AllOrdersAreAlreadyLiquidations
  | CantCancelLiquidationOrder
  | UserIsBeingLiquidated
  | LiquidationsOngoing
  | WrongSpotBalanceType
  | UserCantLiquidateThemself
  | InvalidPerpPositionToLiquidate
  | InvalidBaseAssetAmountForLiquidatePerp
  | InvalidPositionLastFundingRate
  | InvalidPositionDelta
  | UserBankrupt
  | UserNotBankrupt
  | UserHasInvalidBorrow
  | DailyWithdrawLimit
  | DefaultError
  | InsufficientLPTokens
  | CantLPWithPerpPosition
  | UnableToBurnLPTokens
  | TryingToRemoveLiquidityTooFast
  | InvalidSpotMarketVault
  | InvalidSpotMarketState
  | InvalidSerumProgram
  | InvalidSerumMarket
  | InvalidSerumBids
  | InvalidSerumAsks
  | InvalidSerumOpenOrders
  | FailedSerumCPI
  | FailedToFillOnExternalMarket
  | InvalidFulfillmentConfig
  | InvalidFeeStructure
  | InsufficientIFShares
  | MarketActionPaused
  | MarketPlaceOrderPaused
  | MarketFillOrderPaused
  | MarketWithdrawPaused
  | ProtectedAssetTierViolation
  | IsolatedAssetTierViolation
  | UserCantBeDeleted
  | ReduceOnlyWithdrawIncreasedRisk
  | MaxOpenInterest
  | CantResolvePerpBankruptcy
  | LiquidationDoesntSatisfyLimitPrice
  | MarginTradingDisabled
  | InvalidMarketStatusToSettlePnl
  | PerpMarketNotInSettlement
  | PerpMarketNotInReduceOnly
  | PerpMarketSettlementBufferNotReached
  | PerpMarketSettlementUserHasOpenOrders
  | PerpMarketSettlementUserHasActiveLP
  | UnableToSettleExpiredUserPosition
  | UnequalMarketIndexForSpotTransfer
  | InvalidPerpPositionDetected
  | InvalidSpotPositionDetected
  | InvalidAmmDetected
  | InvalidAmmForFillDetected
  | InvalidAmmLimitPriceOverride
  | InvalidOrderFillPrice
  | SpotMarketBalanceInvariantViolated
  | SpotMarketVaultInvariantViolated
  | InvalidPDA
  | InvalidPDASigner
  | RevenueSettingsCannotSettleToIF
  | NoRevenueToSettleToIF
  | NoAmmPerpPnlDeficit
  | SufficientPerpPnlPool
  | InsufficientPerpPnlPool
  | PerpPnlDeficitBelowThreshold
  | MaxRevenueWithdrawPerPeriodReached
  | MaxIFWithdrawReached
  | NoIFWithdrawAvailable
  | InvalidIFUnstake
  | InvalidIFUnstakeSize
  | InvalidIFUnstakeCancel
  | InvalidIFForNewStakes
  | InvalidIFRebase
  | InvalidInsuranceUnstakeSize
  | InvalidOrderLimitPrice
  | InvalidIFDetected
  | InvalidAmmMaxSpreadDetected
  | InvalidConcentrationCoef
  | InvalidSrmVault
  | InvalidVaultOwner
  | InvalidMarketStatusForFills
  | IFWithdrawRequestInProgress
  | NoIFWithdrawRequestInProgress
  | IFWithdrawRequestTooSmall
  | IncorrectSpotMarketAccountPassed
  | BlockchainClockInconsistency
  | InvalidIFSharesDetected
  | NewLPSizeTooSmall
  | MarketStatusInvalidForNewLP
  | InvalidMarkTwapUpdateDetected
  | MarketSettlementAttemptOnActiveMarket
  | MarketSettlementRequiresSettledLP
  | MarketSettlementAttemptTooEarly
  | MarketSettlementTargetPriceInvalid
  | UnsupportedSpotMarket
  | SpotOrdersDisabled
  | MarketBeingInitialized
  | InvalidUserSubAccountId
  | InvalidTriggerOrderCondition
  | InvalidSpotPosition
  | CantTransferBetweenSameUserAccount
  | InvalidPerpPosition
  | UnableToGetLimitPrice
  | InvalidLiquidation
  | SpotFulfillmentConfigDisabled
  | InvalidMaker
  | FailedUnwrap
  | MaxNumberOfUsers
  | InvalidOracleForSettlePnl
  | MarginOrdersOpen
  | TierViolationLiquidatingPerpPnl
  | CouldNotLoadUserData
  | UserWrongMutability
  | InvalidUserAccount
  | CouldNotLoadUserStatsData
  | UserStatsWrongMutability
  | InvalidUserStatsAccount
  | UserNotFound
  | UnableToLoadUserAccount
  | UserStatsNotFound
  | UnableToLoadUserStatsAccount
  | UserNotInactive
  | RevertFill
  | InvalidMarketAccountforDeletion
  | InvalidSpotFulfillmentParams
  | FailedToGetMint
  | FailedPhoenixCPI
  | FailedToDeserializePhoenixMarket
  | InvalidPricePrecision
  | InvalidPhoenixProgram
  | InvalidPhoenixMarket
  | InvalidSwap
  | SwapLimitPriceBreached
  | SpotMarketReduceOnly
  | FundingWasNotUpdated
  | ImpossibleFill
  | CantUpdatePerpBidAskTwap
  | UserReduceOnly
  | InvalidMarginCalculation
  | CantPayUserInitFee
  | CantReclaimRent
  | InsuranceFundOperationPaused
  | NoUnsettledPnl
  | PnlPoolCantSettleUser
  | OracleNonPositive
  | OracleTooVolatile
  | OracleTooUncertain
  | OracleStaleForMargin
  | OracleInsufficientDataPoints
  | OracleStaleForAMM
  | UnableToParsePullOracleMessage
  | MaxBorrows
  | OracleUpdatesNotMonotonic
  | OraclePriceFeedMessageMismatch
  | OracleUnsupportedMessageType
  | OracleDeserializeMessageFailed
  | OracleWrongGuardianSetOwner
  | OracleWrongWriteAuthority
  | OracleWrongVaaOwner
  | OracleTooManyPriceAccountUpdates
  | OracleMismatchedVaaAndPriceUpdates
  | OracleBadRemainingAccountPublicKey
  | FailedOpenbookV2CPI
  | InvalidOpenbookV2Program
  | InvalidOpenbookV2Market
  | NonZeroTransferFee
  | LiquidationOrderFailedToFill
  | InvalidPredictionMarketOrder
  | InvalidVerificationIxIndex
  | SigVerificationFailed
  | MismatchedSwiftOrderParamsMarketIndex
  | InvalidSwiftOrderParam
  | PlaceAndTakeOrderSuccessConditionFailed
  | InvalidHighLeverageModeConfig;

export class InvalidSpotMarketAuthority extends Error {
  static readonly code = 6000;
  readonly code = 6000;
  readonly name = "InvalidSpotMarketAuthority";
  readonly msg = "Invalid Spot Market Authority";

  constructor(readonly logs?: string[]) {
    super("6000: Invalid Spot Market Authority");
  }
}

export class InvalidInsuranceFundAuthority extends Error {
  static readonly code = 6001;
  readonly code = 6001;
  readonly name = "InvalidInsuranceFundAuthority";
  readonly msg = "Clearing house not insurance fund authority";

  constructor(readonly logs?: string[]) {
    super("6001: Clearing house not insurance fund authority");
  }
}

export class InsufficientDeposit extends Error {
  static readonly code = 6002;
  readonly code = 6002;
  readonly name = "InsufficientDeposit";
  readonly msg = "Insufficient deposit";

  constructor(readonly logs?: string[]) {
    super("6002: Insufficient deposit");
  }
}

export class InsufficientCollateral extends Error {
  static readonly code = 6003;
  readonly code = 6003;
  readonly name = "InsufficientCollateral";
  readonly msg = "Insufficient collateral";

  constructor(readonly logs?: string[]) {
    super("6003: Insufficient collateral");
  }
}

export class SufficientCollateral extends Error {
  static readonly code = 6004;
  readonly code = 6004;
  readonly name = "SufficientCollateral";
  readonly msg = "Sufficient collateral";

  constructor(readonly logs?: string[]) {
    super("6004: Sufficient collateral");
  }
}

export class MaxNumberOfPositions extends Error {
  static readonly code = 6005;
  readonly code = 6005;
  readonly name = "MaxNumberOfPositions";
  readonly msg = "Max number of positions taken";

  constructor(readonly logs?: string[]) {
    super("6005: Max number of positions taken");
  }
}

export class AdminControlsPricesDisabled extends Error {
  static readonly code = 6006;
  readonly code = 6006;
  readonly name = "AdminControlsPricesDisabled";
  readonly msg = "Admin Controls Prices Disabled";

  constructor(readonly logs?: string[]) {
    super("6006: Admin Controls Prices Disabled");
  }
}

export class MarketDelisted extends Error {
  static readonly code = 6007;
  readonly code = 6007;
  readonly name = "MarketDelisted";
  readonly msg = "Market Delisted";

  constructor(readonly logs?: string[]) {
    super("6007: Market Delisted");
  }
}

export class MarketIndexAlreadyInitialized extends Error {
  static readonly code = 6008;
  readonly code = 6008;
  readonly name = "MarketIndexAlreadyInitialized";
  readonly msg = "Market Index Already Initialized";

  constructor(readonly logs?: string[]) {
    super("6008: Market Index Already Initialized");
  }
}

export class UserAccountAndUserPositionsAccountMismatch extends Error {
  static readonly code = 6009;
  readonly code = 6009;
  readonly name = "UserAccountAndUserPositionsAccountMismatch";
  readonly msg = "User Account And User Positions Account Mismatch";

  constructor(readonly logs?: string[]) {
    super("6009: User Account And User Positions Account Mismatch");
  }
}

export class UserHasNoPositionInMarket extends Error {
  static readonly code = 6010;
  readonly code = 6010;
  readonly name = "UserHasNoPositionInMarket";
  readonly msg = "User Has No Position In Market";

  constructor(readonly logs?: string[]) {
    super("6010: User Has No Position In Market");
  }
}

export class InvalidInitialPeg extends Error {
  static readonly code = 6011;
  readonly code = 6011;
  readonly name = "InvalidInitialPeg";
  readonly msg = "Invalid Initial Peg";

  constructor(readonly logs?: string[]) {
    super("6011: Invalid Initial Peg");
  }
}

export class InvalidRepegRedundant extends Error {
  static readonly code = 6012;
  readonly code = 6012;
  readonly name = "InvalidRepegRedundant";
  readonly msg = "AMM repeg already configured with amt given";

  constructor(readonly logs?: string[]) {
    super("6012: AMM repeg already configured with amt given");
  }
}

export class InvalidRepegDirection extends Error {
  static readonly code = 6013;
  readonly code = 6013;
  readonly name = "InvalidRepegDirection";
  readonly msg = "AMM repeg incorrect repeg direction";

  constructor(readonly logs?: string[]) {
    super("6013: AMM repeg incorrect repeg direction");
  }
}

export class InvalidRepegProfitability extends Error {
  static readonly code = 6014;
  readonly code = 6014;
  readonly name = "InvalidRepegProfitability";
  readonly msg = "AMM repeg out of bounds pnl";

  constructor(readonly logs?: string[]) {
    super("6014: AMM repeg out of bounds pnl");
  }
}

export class SlippageOutsideLimit extends Error {
  static readonly code = 6015;
  readonly code = 6015;
  readonly name = "SlippageOutsideLimit";
  readonly msg = "Slippage Outside Limit Price";

  constructor(readonly logs?: string[]) {
    super("6015: Slippage Outside Limit Price");
  }
}

export class OrderSizeTooSmall extends Error {
  static readonly code = 6016;
  readonly code = 6016;
  readonly name = "OrderSizeTooSmall";
  readonly msg = "Order Size Too Small";

  constructor(readonly logs?: string[]) {
    super("6016: Order Size Too Small");
  }
}

export class InvalidUpdateK extends Error {
  static readonly code = 6017;
  readonly code = 6017;
  readonly name = "InvalidUpdateK";
  readonly msg = "Price change too large when updating K";

  constructor(readonly logs?: string[]) {
    super("6017: Price change too large when updating K");
  }
}

export class AdminWithdrawTooLarge extends Error {
  static readonly code = 6018;
  readonly code = 6018;
  readonly name = "AdminWithdrawTooLarge";
  readonly msg = "Admin tried to withdraw amount larger than fees collected";

  constructor(readonly logs?: string[]) {
    super("6018: Admin tried to withdraw amount larger than fees collected");
  }
}

export class MathError extends Error {
  static readonly code = 6019;
  readonly code = 6019;
  readonly name = "MathError";
  readonly msg = "Math Error";

  constructor(readonly logs?: string[]) {
    super("6019: Math Error");
  }
}

export class BnConversionError extends Error {
  static readonly code = 6020;
  readonly code = 6020;
  readonly name = "BnConversionError";
  readonly msg = "Conversion to u128/u64 failed with an overflow or underflow";

  constructor(readonly logs?: string[]) {
    super("6020: Conversion to u128/u64 failed with an overflow or underflow");
  }
}

export class ClockUnavailable extends Error {
  static readonly code = 6021;
  readonly code = 6021;
  readonly name = "ClockUnavailable";
  readonly msg = "Clock unavailable";

  constructor(readonly logs?: string[]) {
    super("6021: Clock unavailable");
  }
}

export class UnableToLoadOracle extends Error {
  static readonly code = 6022;
  readonly code = 6022;
  readonly name = "UnableToLoadOracle";
  readonly msg = "Unable To Load Oracles";

  constructor(readonly logs?: string[]) {
    super("6022: Unable To Load Oracles");
  }
}

export class PriceBandsBreached extends Error {
  static readonly code = 6023;
  readonly code = 6023;
  readonly name = "PriceBandsBreached";
  readonly msg = "Price Bands Breached";

  constructor(readonly logs?: string[]) {
    super("6023: Price Bands Breached");
  }
}

export class ExchangePaused extends Error {
  static readonly code = 6024;
  readonly code = 6024;
  readonly name = "ExchangePaused";
  readonly msg = "Exchange is paused";

  constructor(readonly logs?: string[]) {
    super("6024: Exchange is paused");
  }
}

export class InvalidWhitelistToken extends Error {
  static readonly code = 6025;
  readonly code = 6025;
  readonly name = "InvalidWhitelistToken";
  readonly msg = "Invalid whitelist token";

  constructor(readonly logs?: string[]) {
    super("6025: Invalid whitelist token");
  }
}

export class WhitelistTokenNotFound extends Error {
  static readonly code = 6026;
  readonly code = 6026;
  readonly name = "WhitelistTokenNotFound";
  readonly msg = "Whitelist token not found";

  constructor(readonly logs?: string[]) {
    super("6026: Whitelist token not found");
  }
}

export class InvalidDiscountToken extends Error {
  static readonly code = 6027;
  readonly code = 6027;
  readonly name = "InvalidDiscountToken";
  readonly msg = "Invalid discount token";

  constructor(readonly logs?: string[]) {
    super("6027: Invalid discount token");
  }
}

export class DiscountTokenNotFound extends Error {
  static readonly code = 6028;
  readonly code = 6028;
  readonly name = "DiscountTokenNotFound";
  readonly msg = "Discount token not found";

  constructor(readonly logs?: string[]) {
    super("6028: Discount token not found");
  }
}

export class ReferrerNotFound extends Error {
  static readonly code = 6029;
  readonly code = 6029;
  readonly name = "ReferrerNotFound";
  readonly msg = "Referrer not found";

  constructor(readonly logs?: string[]) {
    super("6029: Referrer not found");
  }
}

export class ReferrerStatsNotFound extends Error {
  static readonly code = 6030;
  readonly code = 6030;
  readonly name = "ReferrerStatsNotFound";
  readonly msg = "ReferrerNotFound";

  constructor(readonly logs?: string[]) {
    super("6030: ReferrerNotFound");
  }
}

export class ReferrerMustBeWritable extends Error {
  static readonly code = 6031;
  readonly code = 6031;
  readonly name = "ReferrerMustBeWritable";
  readonly msg = "ReferrerMustBeWritable";

  constructor(readonly logs?: string[]) {
    super("6031: ReferrerMustBeWritable");
  }
}

export class ReferrerStatsMustBeWritable extends Error {
  static readonly code = 6032;
  readonly code = 6032;
  readonly name = "ReferrerStatsMustBeWritable";
  readonly msg = "ReferrerMustBeWritable";

  constructor(readonly logs?: string[]) {
    super("6032: ReferrerMustBeWritable");
  }
}

export class ReferrerAndReferrerStatsAuthorityUnequal extends Error {
  static readonly code = 6033;
  readonly code = 6033;
  readonly name = "ReferrerAndReferrerStatsAuthorityUnequal";
  readonly msg = "ReferrerAndReferrerStatsAuthorityUnequal";

  constructor(readonly logs?: string[]) {
    super("6033: ReferrerAndReferrerStatsAuthorityUnequal");
  }
}

export class InvalidReferrer extends Error {
  static readonly code = 6034;
  readonly code = 6034;
  readonly name = "InvalidReferrer";
  readonly msg = "InvalidReferrer";

  constructor(readonly logs?: string[]) {
    super("6034: InvalidReferrer");
  }
}

export class InvalidOracle extends Error {
  static readonly code = 6035;
  readonly code = 6035;
  readonly name = "InvalidOracle";
  readonly msg = "InvalidOracle";

  constructor(readonly logs?: string[]) {
    super("6035: InvalidOracle");
  }
}

export class OracleNotFound extends Error {
  static readonly code = 6036;
  readonly code = 6036;
  readonly name = "OracleNotFound";
  readonly msg = "OracleNotFound";

  constructor(readonly logs?: string[]) {
    super("6036: OracleNotFound");
  }
}

export class LiquidationsBlockedByOracle extends Error {
  static readonly code = 6037;
  readonly code = 6037;
  readonly name = "LiquidationsBlockedByOracle";
  readonly msg = "Liquidations Blocked By Oracle";

  constructor(readonly logs?: string[]) {
    super("6037: Liquidations Blocked By Oracle");
  }
}

export class MaxDeposit extends Error {
  static readonly code = 6038;
  readonly code = 6038;
  readonly name = "MaxDeposit";
  readonly msg = "Can not deposit more than max deposit";

  constructor(readonly logs?: string[]) {
    super("6038: Can not deposit more than max deposit");
  }
}

export class CantDeleteUserWithCollateral extends Error {
  static readonly code = 6039;
  readonly code = 6039;
  readonly name = "CantDeleteUserWithCollateral";
  readonly msg = "Can not delete user that still has collateral";

  constructor(readonly logs?: string[]) {
    super("6039: Can not delete user that still has collateral");
  }
}

export class InvalidFundingProfitability extends Error {
  static readonly code = 6040;
  readonly code = 6040;
  readonly name = "InvalidFundingProfitability";
  readonly msg = "AMM funding out of bounds pnl";

  constructor(readonly logs?: string[]) {
    super("6040: AMM funding out of bounds pnl");
  }
}

export class CastingFailure extends Error {
  static readonly code = 6041;
  readonly code = 6041;
  readonly name = "CastingFailure";
  readonly msg = "Casting Failure";

  constructor(readonly logs?: string[]) {
    super("6041: Casting Failure");
  }
}

export class InvalidOrder extends Error {
  static readonly code = 6042;
  readonly code = 6042;
  readonly name = "InvalidOrder";
  readonly msg = "InvalidOrder";

  constructor(readonly logs?: string[]) {
    super("6042: InvalidOrder");
  }
}

export class InvalidOrderMaxTs extends Error {
  static readonly code = 6043;
  readonly code = 6043;
  readonly name = "InvalidOrderMaxTs";
  readonly msg = "InvalidOrderMaxTs";

  constructor(readonly logs?: string[]) {
    super("6043: InvalidOrderMaxTs");
  }
}

export class InvalidOrderMarketType extends Error {
  static readonly code = 6044;
  readonly code = 6044;
  readonly name = "InvalidOrderMarketType";
  readonly msg = "InvalidOrderMarketType";

  constructor(readonly logs?: string[]) {
    super("6044: InvalidOrderMarketType");
  }
}

export class InvalidOrderForInitialMarginReq extends Error {
  static readonly code = 6045;
  readonly code = 6045;
  readonly name = "InvalidOrderForInitialMarginReq";
  readonly msg = "InvalidOrderForInitialMarginReq";

  constructor(readonly logs?: string[]) {
    super("6045: InvalidOrderForInitialMarginReq");
  }
}

export class InvalidOrderNotRiskReducing extends Error {
  static readonly code = 6046;
  readonly code = 6046;
  readonly name = "InvalidOrderNotRiskReducing";
  readonly msg = "InvalidOrderNotRiskReducing";

  constructor(readonly logs?: string[]) {
    super("6046: InvalidOrderNotRiskReducing");
  }
}

export class InvalidOrderSizeTooSmall extends Error {
  static readonly code = 6047;
  readonly code = 6047;
  readonly name = "InvalidOrderSizeTooSmall";
  readonly msg = "InvalidOrderSizeTooSmall";

  constructor(readonly logs?: string[]) {
    super("6047: InvalidOrderSizeTooSmall");
  }
}

export class InvalidOrderNotStepSizeMultiple extends Error {
  static readonly code = 6048;
  readonly code = 6048;
  readonly name = "InvalidOrderNotStepSizeMultiple";
  readonly msg = "InvalidOrderNotStepSizeMultiple";

  constructor(readonly logs?: string[]) {
    super("6048: InvalidOrderNotStepSizeMultiple");
  }
}

export class InvalidOrderBaseQuoteAsset extends Error {
  static readonly code = 6049;
  readonly code = 6049;
  readonly name = "InvalidOrderBaseQuoteAsset";
  readonly msg = "InvalidOrderBaseQuoteAsset";

  constructor(readonly logs?: string[]) {
    super("6049: InvalidOrderBaseQuoteAsset");
  }
}

export class InvalidOrderIOC extends Error {
  static readonly code = 6050;
  readonly code = 6050;
  readonly name = "InvalidOrderIOC";
  readonly msg = "InvalidOrderIOC";

  constructor(readonly logs?: string[]) {
    super("6050: InvalidOrderIOC");
  }
}

export class InvalidOrderPostOnly extends Error {
  static readonly code = 6051;
  readonly code = 6051;
  readonly name = "InvalidOrderPostOnly";
  readonly msg = "InvalidOrderPostOnly";

  constructor(readonly logs?: string[]) {
    super("6051: InvalidOrderPostOnly");
  }
}

export class InvalidOrderIOCPostOnly extends Error {
  static readonly code = 6052;
  readonly code = 6052;
  readonly name = "InvalidOrderIOCPostOnly";
  readonly msg = "InvalidOrderIOCPostOnly";

  constructor(readonly logs?: string[]) {
    super("6052: InvalidOrderIOCPostOnly");
  }
}

export class InvalidOrderTrigger extends Error {
  static readonly code = 6053;
  readonly code = 6053;
  readonly name = "InvalidOrderTrigger";
  readonly msg = "InvalidOrderTrigger";

  constructor(readonly logs?: string[]) {
    super("6053: InvalidOrderTrigger");
  }
}

export class InvalidOrderAuction extends Error {
  static readonly code = 6054;
  readonly code = 6054;
  readonly name = "InvalidOrderAuction";
  readonly msg = "InvalidOrderAuction";

  constructor(readonly logs?: string[]) {
    super("6054: InvalidOrderAuction");
  }
}

export class InvalidOrderOracleOffset extends Error {
  static readonly code = 6055;
  readonly code = 6055;
  readonly name = "InvalidOrderOracleOffset";
  readonly msg = "InvalidOrderOracleOffset";

  constructor(readonly logs?: string[]) {
    super("6055: InvalidOrderOracleOffset");
  }
}

export class InvalidOrderMinOrderSize extends Error {
  static readonly code = 6056;
  readonly code = 6056;
  readonly name = "InvalidOrderMinOrderSize";
  readonly msg = "InvalidOrderMinOrderSize";

  constructor(readonly logs?: string[]) {
    super("6056: InvalidOrderMinOrderSize");
  }
}

export class PlacePostOnlyLimitFailure extends Error {
  static readonly code = 6057;
  readonly code = 6057;
  readonly name = "PlacePostOnlyLimitFailure";
  readonly msg = "Failed to Place Post-Only Limit Order";

  constructor(readonly logs?: string[]) {
    super("6057: Failed to Place Post-Only Limit Order");
  }
}

export class UserHasNoOrder extends Error {
  static readonly code = 6058;
  readonly code = 6058;
  readonly name = "UserHasNoOrder";
  readonly msg = "User has no order";

  constructor(readonly logs?: string[]) {
    super("6058: User has no order");
  }
}

export class OrderAmountTooSmall extends Error {
  static readonly code = 6059;
  readonly code = 6059;
  readonly name = "OrderAmountTooSmall";
  readonly msg = "Order Amount Too Small";

  constructor(readonly logs?: string[]) {
    super("6059: Order Amount Too Small");
  }
}

export class MaxNumberOfOrders extends Error {
  static readonly code = 6060;
  readonly code = 6060;
  readonly name = "MaxNumberOfOrders";
  readonly msg = "Max number of orders taken";

  constructor(readonly logs?: string[]) {
    super("6060: Max number of orders taken");
  }
}

export class OrderDoesNotExist extends Error {
  static readonly code = 6061;
  readonly code = 6061;
  readonly name = "OrderDoesNotExist";
  readonly msg = "Order does not exist";

  constructor(readonly logs?: string[]) {
    super("6061: Order does not exist");
  }
}

export class OrderNotOpen extends Error {
  static readonly code = 6062;
  readonly code = 6062;
  readonly name = "OrderNotOpen";
  readonly msg = "Order not open";

  constructor(readonly logs?: string[]) {
    super("6062: Order not open");
  }
}

export class FillOrderDidNotUpdateState extends Error {
  static readonly code = 6063;
  readonly code = 6063;
  readonly name = "FillOrderDidNotUpdateState";
  readonly msg = "FillOrderDidNotUpdateState";

  constructor(readonly logs?: string[]) {
    super("6063: FillOrderDidNotUpdateState");
  }
}

export class ReduceOnlyOrderIncreasedRisk extends Error {
  static readonly code = 6064;
  readonly code = 6064;
  readonly name = "ReduceOnlyOrderIncreasedRisk";
  readonly msg = "Reduce only order increased risk";

  constructor(readonly logs?: string[]) {
    super("6064: Reduce only order increased risk");
  }
}

export class UnableToLoadAccountLoader extends Error {
  static readonly code = 6065;
  readonly code = 6065;
  readonly name = "UnableToLoadAccountLoader";
  readonly msg = "Unable to load AccountLoader";

  constructor(readonly logs?: string[]) {
    super("6065: Unable to load AccountLoader");
  }
}

export class TradeSizeTooLarge extends Error {
  static readonly code = 6066;
  readonly code = 6066;
  readonly name = "TradeSizeTooLarge";
  readonly msg = "Trade Size Too Large";

  constructor(readonly logs?: string[]) {
    super("6066: Trade Size Too Large");
  }
}

export class UserCantReferThemselves extends Error {
  static readonly code = 6067;
  readonly code = 6067;
  readonly name = "UserCantReferThemselves";
  readonly msg = "User cant refer themselves";

  constructor(readonly logs?: string[]) {
    super("6067: User cant refer themselves");
  }
}

export class DidNotReceiveExpectedReferrer extends Error {
  static readonly code = 6068;
  readonly code = 6068;
  readonly name = "DidNotReceiveExpectedReferrer";
  readonly msg = "Did not receive expected referrer";

  constructor(readonly logs?: string[]) {
    super("6068: Did not receive expected referrer");
  }
}

export class CouldNotDeserializeReferrer extends Error {
  static readonly code = 6069;
  readonly code = 6069;
  readonly name = "CouldNotDeserializeReferrer";
  readonly msg = "Could not deserialize referrer";

  constructor(readonly logs?: string[]) {
    super("6069: Could not deserialize referrer");
  }
}

export class CouldNotDeserializeReferrerStats extends Error {
  static readonly code = 6070;
  readonly code = 6070;
  readonly name = "CouldNotDeserializeReferrerStats";
  readonly msg = "Could not deserialize referrer stats";

  constructor(readonly logs?: string[]) {
    super("6070: Could not deserialize referrer stats");
  }
}

export class UserOrderIdAlreadyInUse extends Error {
  static readonly code = 6071;
  readonly code = 6071;
  readonly name = "UserOrderIdAlreadyInUse";
  readonly msg = "User Order Id Already In Use";

  constructor(readonly logs?: string[]) {
    super("6071: User Order Id Already In Use");
  }
}

export class NoPositionsLiquidatable extends Error {
  static readonly code = 6072;
  readonly code = 6072;
  readonly name = "NoPositionsLiquidatable";
  readonly msg = "No positions liquidatable";

  constructor(readonly logs?: string[]) {
    super("6072: No positions liquidatable");
  }
}

export class InvalidMarginRatio extends Error {
  static readonly code = 6073;
  readonly code = 6073;
  readonly name = "InvalidMarginRatio";
  readonly msg = "Invalid Margin Ratio";

  constructor(readonly logs?: string[]) {
    super("6073: Invalid Margin Ratio");
  }
}

export class CantCancelPostOnlyOrder extends Error {
  static readonly code = 6074;
  readonly code = 6074;
  readonly name = "CantCancelPostOnlyOrder";
  readonly msg = "Cant Cancel Post Only Order";

  constructor(readonly logs?: string[]) {
    super("6074: Cant Cancel Post Only Order");
  }
}

export class InvalidOracleOffset extends Error {
  static readonly code = 6075;
  readonly code = 6075;
  readonly name = "InvalidOracleOffset";
  readonly msg = "InvalidOracleOffset";

  constructor(readonly logs?: string[]) {
    super("6075: InvalidOracleOffset");
  }
}

export class CantExpireOrders extends Error {
  static readonly code = 6076;
  readonly code = 6076;
  readonly name = "CantExpireOrders";
  readonly msg = "CantExpireOrders";

  constructor(readonly logs?: string[]) {
    super("6076: CantExpireOrders");
  }
}

export class CouldNotLoadMarketData extends Error {
  static readonly code = 6077;
  readonly code = 6077;
  readonly name = "CouldNotLoadMarketData";
  readonly msg = "CouldNotLoadMarketData";

  constructor(readonly logs?: string[]) {
    super("6077: CouldNotLoadMarketData");
  }
}

export class PerpMarketNotFound extends Error {
  static readonly code = 6078;
  readonly code = 6078;
  readonly name = "PerpMarketNotFound";
  readonly msg = "PerpMarketNotFound";

  constructor(readonly logs?: string[]) {
    super("6078: PerpMarketNotFound");
  }
}

export class InvalidMarketAccount extends Error {
  static readonly code = 6079;
  readonly code = 6079;
  readonly name = "InvalidMarketAccount";
  readonly msg = "InvalidMarketAccount";

  constructor(readonly logs?: string[]) {
    super("6079: InvalidMarketAccount");
  }
}

export class UnableToLoadPerpMarketAccount extends Error {
  static readonly code = 6080;
  readonly code = 6080;
  readonly name = "UnableToLoadPerpMarketAccount";
  readonly msg = "UnableToLoadMarketAccount";

  constructor(readonly logs?: string[]) {
    super("6080: UnableToLoadMarketAccount");
  }
}

export class MarketWrongMutability extends Error {
  static readonly code = 6081;
  readonly code = 6081;
  readonly name = "MarketWrongMutability";
  readonly msg = "MarketWrongMutability";

  constructor(readonly logs?: string[]) {
    super("6081: MarketWrongMutability");
  }
}

export class UnableToCastUnixTime extends Error {
  static readonly code = 6082;
  readonly code = 6082;
  readonly name = "UnableToCastUnixTime";
  readonly msg = "UnableToCastUnixTime";

  constructor(readonly logs?: string[]) {
    super("6082: UnableToCastUnixTime");
  }
}

export class CouldNotFindSpotPosition extends Error {
  static readonly code = 6083;
  readonly code = 6083;
  readonly name = "CouldNotFindSpotPosition";
  readonly msg = "CouldNotFindSpotPosition";

  constructor(readonly logs?: string[]) {
    super("6083: CouldNotFindSpotPosition");
  }
}

export class NoSpotPositionAvailable extends Error {
  static readonly code = 6084;
  readonly code = 6084;
  readonly name = "NoSpotPositionAvailable";
  readonly msg = "NoSpotPositionAvailable";

  constructor(readonly logs?: string[]) {
    super("6084: NoSpotPositionAvailable");
  }
}

export class InvalidSpotMarketInitialization extends Error {
  static readonly code = 6085;
  readonly code = 6085;
  readonly name = "InvalidSpotMarketInitialization";
  readonly msg = "InvalidSpotMarketInitialization";

  constructor(readonly logs?: string[]) {
    super("6085: InvalidSpotMarketInitialization");
  }
}

export class CouldNotLoadSpotMarketData extends Error {
  static readonly code = 6086;
  readonly code = 6086;
  readonly name = "CouldNotLoadSpotMarketData";
  readonly msg = "CouldNotLoadSpotMarketData";

  constructor(readonly logs?: string[]) {
    super("6086: CouldNotLoadSpotMarketData");
  }
}

export class SpotMarketNotFound extends Error {
  static readonly code = 6087;
  readonly code = 6087;
  readonly name = "SpotMarketNotFound";
  readonly msg = "SpotMarketNotFound";

  constructor(readonly logs?: string[]) {
    super("6087: SpotMarketNotFound");
  }
}

export class InvalidSpotMarketAccount extends Error {
  static readonly code = 6088;
  readonly code = 6088;
  readonly name = "InvalidSpotMarketAccount";
  readonly msg = "InvalidSpotMarketAccount";

  constructor(readonly logs?: string[]) {
    super("6088: InvalidSpotMarketAccount");
  }
}

export class UnableToLoadSpotMarketAccount extends Error {
  static readonly code = 6089;
  readonly code = 6089;
  readonly name = "UnableToLoadSpotMarketAccount";
  readonly msg = "UnableToLoadSpotMarketAccount";

  constructor(readonly logs?: string[]) {
    super("6089: UnableToLoadSpotMarketAccount");
  }
}

export class SpotMarketWrongMutability extends Error {
  static readonly code = 6090;
  readonly code = 6090;
  readonly name = "SpotMarketWrongMutability";
  readonly msg = "SpotMarketWrongMutability";

  constructor(readonly logs?: string[]) {
    super("6090: SpotMarketWrongMutability");
  }
}

export class SpotMarketInterestNotUpToDate extends Error {
  static readonly code = 6091;
  readonly code = 6091;
  readonly name = "SpotMarketInterestNotUpToDate";
  readonly msg = "SpotInterestNotUpToDate";

  constructor(readonly logs?: string[]) {
    super("6091: SpotInterestNotUpToDate");
  }
}

export class SpotMarketInsufficientDeposits extends Error {
  static readonly code = 6092;
  readonly code = 6092;
  readonly name = "SpotMarketInsufficientDeposits";
  readonly msg = "SpotMarketInsufficientDeposits";

  constructor(readonly logs?: string[]) {
    super("6092: SpotMarketInsufficientDeposits");
  }
}

export class UserMustSettleTheirOwnPositiveUnsettledPNL extends Error {
  static readonly code = 6093;
  readonly code = 6093;
  readonly name = "UserMustSettleTheirOwnPositiveUnsettledPNL";
  readonly msg = "UserMustSettleTheirOwnPositiveUnsettledPNL";

  constructor(readonly logs?: string[]) {
    super("6093: UserMustSettleTheirOwnPositiveUnsettledPNL");
  }
}

export class CantUpdatePoolBalanceType extends Error {
  static readonly code = 6094;
  readonly code = 6094;
  readonly name = "CantUpdatePoolBalanceType";
  readonly msg = "CantUpdatePoolBalanceType";

  constructor(readonly logs?: string[]) {
    super("6094: CantUpdatePoolBalanceType");
  }
}

export class InsufficientCollateralForSettlingPNL extends Error {
  static readonly code = 6095;
  readonly code = 6095;
  readonly name = "InsufficientCollateralForSettlingPNL";
  readonly msg = "InsufficientCollateralForSettlingPNL";

  constructor(readonly logs?: string[]) {
    super("6095: InsufficientCollateralForSettlingPNL");
  }
}

export class AMMNotUpdatedInSameSlot extends Error {
  static readonly code = 6096;
  readonly code = 6096;
  readonly name = "AMMNotUpdatedInSameSlot";
  readonly msg = "AMMNotUpdatedInSameSlot";

  constructor(readonly logs?: string[]) {
    super("6096: AMMNotUpdatedInSameSlot");
  }
}

export class AuctionNotComplete extends Error {
  static readonly code = 6097;
  readonly code = 6097;
  readonly name = "AuctionNotComplete";
  readonly msg = "AuctionNotComplete";

  constructor(readonly logs?: string[]) {
    super("6097: AuctionNotComplete");
  }
}

export class MakerNotFound extends Error {
  static readonly code = 6098;
  readonly code = 6098;
  readonly name = "MakerNotFound";
  readonly msg = "MakerNotFound";

  constructor(readonly logs?: string[]) {
    super("6098: MakerNotFound");
  }
}

export class MakerStatsNotFound extends Error {
  static readonly code = 6099;
  readonly code = 6099;
  readonly name = "MakerStatsNotFound";
  readonly msg = "MakerNotFound";

  constructor(readonly logs?: string[]) {
    super("6099: MakerNotFound");
  }
}

export class MakerMustBeWritable extends Error {
  static readonly code = 6100;
  readonly code = 6100;
  readonly name = "MakerMustBeWritable";
  readonly msg = "MakerMustBeWritable";

  constructor(readonly logs?: string[]) {
    super("6100: MakerMustBeWritable");
  }
}

export class MakerStatsMustBeWritable extends Error {
  static readonly code = 6101;
  readonly code = 6101;
  readonly name = "MakerStatsMustBeWritable";
  readonly msg = "MakerMustBeWritable";

  constructor(readonly logs?: string[]) {
    super("6101: MakerMustBeWritable");
  }
}

export class MakerOrderNotFound extends Error {
  static readonly code = 6102;
  readonly code = 6102;
  readonly name = "MakerOrderNotFound";
  readonly msg = "MakerOrderNotFound";

  constructor(readonly logs?: string[]) {
    super("6102: MakerOrderNotFound");
  }
}

export class CouldNotDeserializeMaker extends Error {
  static readonly code = 6103;
  readonly code = 6103;
  readonly name = "CouldNotDeserializeMaker";
  readonly msg = "CouldNotDeserializeMaker";

  constructor(readonly logs?: string[]) {
    super("6103: CouldNotDeserializeMaker");
  }
}

export class CouldNotDeserializeMakerStats extends Error {
  static readonly code = 6104;
  readonly code = 6104;
  readonly name = "CouldNotDeserializeMakerStats";
  readonly msg = "CouldNotDeserializeMaker";

  constructor(readonly logs?: string[]) {
    super("6104: CouldNotDeserializeMaker");
  }
}

export class AuctionPriceDoesNotSatisfyMaker extends Error {
  static readonly code = 6105;
  readonly code = 6105;
  readonly name = "AuctionPriceDoesNotSatisfyMaker";
  readonly msg = "AuctionPriceDoesNotSatisfyMaker";

  constructor(readonly logs?: string[]) {
    super("6105: AuctionPriceDoesNotSatisfyMaker");
  }
}

export class MakerCantFulfillOwnOrder extends Error {
  static readonly code = 6106;
  readonly code = 6106;
  readonly name = "MakerCantFulfillOwnOrder";
  readonly msg = "MakerCantFulfillOwnOrder";

  constructor(readonly logs?: string[]) {
    super("6106: MakerCantFulfillOwnOrder");
  }
}

export class MakerOrderMustBePostOnly extends Error {
  static readonly code = 6107;
  readonly code = 6107;
  readonly name = "MakerOrderMustBePostOnly";
  readonly msg = "MakerOrderMustBePostOnly";

  constructor(readonly logs?: string[]) {
    super("6107: MakerOrderMustBePostOnly");
  }
}

export class CantMatchTwoPostOnlys extends Error {
  static readonly code = 6108;
  readonly code = 6108;
  readonly name = "CantMatchTwoPostOnlys";
  readonly msg = "CantMatchTwoPostOnlys";

  constructor(readonly logs?: string[]) {
    super("6108: CantMatchTwoPostOnlys");
  }
}

export class OrderBreachesOraclePriceLimits extends Error {
  static readonly code = 6109;
  readonly code = 6109;
  readonly name = "OrderBreachesOraclePriceLimits";
  readonly msg = "OrderBreachesOraclePriceLimits";

  constructor(readonly logs?: string[]) {
    super("6109: OrderBreachesOraclePriceLimits");
  }
}

export class OrderMustBeTriggeredFirst extends Error {
  static readonly code = 6110;
  readonly code = 6110;
  readonly name = "OrderMustBeTriggeredFirst";
  readonly msg = "OrderMustBeTriggeredFirst";

  constructor(readonly logs?: string[]) {
    super("6110: OrderMustBeTriggeredFirst");
  }
}

export class OrderNotTriggerable extends Error {
  static readonly code = 6111;
  readonly code = 6111;
  readonly name = "OrderNotTriggerable";
  readonly msg = "OrderNotTriggerable";

  constructor(readonly logs?: string[]) {
    super("6111: OrderNotTriggerable");
  }
}

export class OrderDidNotSatisfyTriggerCondition extends Error {
  static readonly code = 6112;
  readonly code = 6112;
  readonly name = "OrderDidNotSatisfyTriggerCondition";
  readonly msg = "OrderDidNotSatisfyTriggerCondition";

  constructor(readonly logs?: string[]) {
    super("6112: OrderDidNotSatisfyTriggerCondition");
  }
}

export class PositionAlreadyBeingLiquidated extends Error {
  static readonly code = 6113;
  readonly code = 6113;
  readonly name = "PositionAlreadyBeingLiquidated";
  readonly msg = "PositionAlreadyBeingLiquidated";

  constructor(readonly logs?: string[]) {
    super("6113: PositionAlreadyBeingLiquidated");
  }
}

export class PositionDoesntHaveOpenPositionOrOrders extends Error {
  static readonly code = 6114;
  readonly code = 6114;
  readonly name = "PositionDoesntHaveOpenPositionOrOrders";
  readonly msg = "PositionDoesntHaveOpenPositionOrOrders";

  constructor(readonly logs?: string[]) {
    super("6114: PositionDoesntHaveOpenPositionOrOrders");
  }
}

export class AllOrdersAreAlreadyLiquidations extends Error {
  static readonly code = 6115;
  readonly code = 6115;
  readonly name = "AllOrdersAreAlreadyLiquidations";
  readonly msg = "AllOrdersAreAlreadyLiquidations";

  constructor(readonly logs?: string[]) {
    super("6115: AllOrdersAreAlreadyLiquidations");
  }
}

export class CantCancelLiquidationOrder extends Error {
  static readonly code = 6116;
  readonly code = 6116;
  readonly name = "CantCancelLiquidationOrder";
  readonly msg = "CantCancelLiquidationOrder";

  constructor(readonly logs?: string[]) {
    super("6116: CantCancelLiquidationOrder");
  }
}

export class UserIsBeingLiquidated extends Error {
  static readonly code = 6117;
  readonly code = 6117;
  readonly name = "UserIsBeingLiquidated";
  readonly msg = "UserIsBeingLiquidated";

  constructor(readonly logs?: string[]) {
    super("6117: UserIsBeingLiquidated");
  }
}

export class LiquidationsOngoing extends Error {
  static readonly code = 6118;
  readonly code = 6118;
  readonly name = "LiquidationsOngoing";
  readonly msg = "LiquidationsOngoing";

  constructor(readonly logs?: string[]) {
    super("6118: LiquidationsOngoing");
  }
}

export class WrongSpotBalanceType extends Error {
  static readonly code = 6119;
  readonly code = 6119;
  readonly name = "WrongSpotBalanceType";
  readonly msg = "WrongSpotBalanceType";

  constructor(readonly logs?: string[]) {
    super("6119: WrongSpotBalanceType");
  }
}

export class UserCantLiquidateThemself extends Error {
  static readonly code = 6120;
  readonly code = 6120;
  readonly name = "UserCantLiquidateThemself";
  readonly msg = "UserCantLiquidateThemself";

  constructor(readonly logs?: string[]) {
    super("6120: UserCantLiquidateThemself");
  }
}

export class InvalidPerpPositionToLiquidate extends Error {
  static readonly code = 6121;
  readonly code = 6121;
  readonly name = "InvalidPerpPositionToLiquidate";
  readonly msg = "InvalidPerpPositionToLiquidate";

  constructor(readonly logs?: string[]) {
    super("6121: InvalidPerpPositionToLiquidate");
  }
}

export class InvalidBaseAssetAmountForLiquidatePerp extends Error {
  static readonly code = 6122;
  readonly code = 6122;
  readonly name = "InvalidBaseAssetAmountForLiquidatePerp";
  readonly msg = "InvalidBaseAssetAmountForLiquidatePerp";

  constructor(readonly logs?: string[]) {
    super("6122: InvalidBaseAssetAmountForLiquidatePerp");
  }
}

export class InvalidPositionLastFundingRate extends Error {
  static readonly code = 6123;
  readonly code = 6123;
  readonly name = "InvalidPositionLastFundingRate";
  readonly msg = "InvalidPositionLastFundingRate";

  constructor(readonly logs?: string[]) {
    super("6123: InvalidPositionLastFundingRate");
  }
}

export class InvalidPositionDelta extends Error {
  static readonly code = 6124;
  readonly code = 6124;
  readonly name = "InvalidPositionDelta";
  readonly msg = "InvalidPositionDelta";

  constructor(readonly logs?: string[]) {
    super("6124: InvalidPositionDelta");
  }
}

export class UserBankrupt extends Error {
  static readonly code = 6125;
  readonly code = 6125;
  readonly name = "UserBankrupt";
  readonly msg = "UserBankrupt";

  constructor(readonly logs?: string[]) {
    super("6125: UserBankrupt");
  }
}

export class UserNotBankrupt extends Error {
  static readonly code = 6126;
  readonly code = 6126;
  readonly name = "UserNotBankrupt";
  readonly msg = "UserNotBankrupt";

  constructor(readonly logs?: string[]) {
    super("6126: UserNotBankrupt");
  }
}

export class UserHasInvalidBorrow extends Error {
  static readonly code = 6127;
  readonly code = 6127;
  readonly name = "UserHasInvalidBorrow";
  readonly msg = "UserHasInvalidBorrow";

  constructor(readonly logs?: string[]) {
    super("6127: UserHasInvalidBorrow");
  }
}

export class DailyWithdrawLimit extends Error {
  static readonly code = 6128;
  readonly code = 6128;
  readonly name = "DailyWithdrawLimit";
  readonly msg = "DailyWithdrawLimit";

  constructor(readonly logs?: string[]) {
    super("6128: DailyWithdrawLimit");
  }
}

export class DefaultError extends Error {
  static readonly code = 6129;
  readonly code = 6129;
  readonly name = "DefaultError";
  readonly msg = "DefaultError";

  constructor(readonly logs?: string[]) {
    super("6129: DefaultError");
  }
}

export class InsufficientLPTokens extends Error {
  static readonly code = 6130;
  readonly code = 6130;
  readonly name = "InsufficientLPTokens";
  readonly msg = "Insufficient LP tokens";

  constructor(readonly logs?: string[]) {
    super("6130: Insufficient LP tokens");
  }
}

export class CantLPWithPerpPosition extends Error {
  static readonly code = 6131;
  readonly code = 6131;
  readonly name = "CantLPWithPerpPosition";
  readonly msg = "Cant LP with a market position";

  constructor(readonly logs?: string[]) {
    super("6131: Cant LP with a market position");
  }
}

export class UnableToBurnLPTokens extends Error {
  static readonly code = 6132;
  readonly code = 6132;
  readonly name = "UnableToBurnLPTokens";
  readonly msg = "Unable to burn LP tokens";

  constructor(readonly logs?: string[]) {
    super("6132: Unable to burn LP tokens");
  }
}

export class TryingToRemoveLiquidityTooFast extends Error {
  static readonly code = 6133;
  readonly code = 6133;
  readonly name = "TryingToRemoveLiquidityTooFast";
  readonly msg = "Trying to remove liqudity too fast after adding it";

  constructor(readonly logs?: string[]) {
    super("6133: Trying to remove liqudity too fast after adding it");
  }
}

export class InvalidSpotMarketVault extends Error {
  static readonly code = 6134;
  readonly code = 6134;
  readonly name = "InvalidSpotMarketVault";
  readonly msg = "Invalid Spot Market Vault";

  constructor(readonly logs?: string[]) {
    super("6134: Invalid Spot Market Vault");
  }
}

export class InvalidSpotMarketState extends Error {
  static readonly code = 6135;
  readonly code = 6135;
  readonly name = "InvalidSpotMarketState";
  readonly msg = "Invalid Spot Market State";

  constructor(readonly logs?: string[]) {
    super("6135: Invalid Spot Market State");
  }
}

export class InvalidSerumProgram extends Error {
  static readonly code = 6136;
  readonly code = 6136;
  readonly name = "InvalidSerumProgram";
  readonly msg = "InvalidSerumProgram";

  constructor(readonly logs?: string[]) {
    super("6136: InvalidSerumProgram");
  }
}

export class InvalidSerumMarket extends Error {
  static readonly code = 6137;
  readonly code = 6137;
  readonly name = "InvalidSerumMarket";
  readonly msg = "InvalidSerumMarket";

  constructor(readonly logs?: string[]) {
    super("6137: InvalidSerumMarket");
  }
}

export class InvalidSerumBids extends Error {
  static readonly code = 6138;
  readonly code = 6138;
  readonly name = "InvalidSerumBids";
  readonly msg = "InvalidSerumBids";

  constructor(readonly logs?: string[]) {
    super("6138: InvalidSerumBids");
  }
}

export class InvalidSerumAsks extends Error {
  static readonly code = 6139;
  readonly code = 6139;
  readonly name = "InvalidSerumAsks";
  readonly msg = "InvalidSerumAsks";

  constructor(readonly logs?: string[]) {
    super("6139: InvalidSerumAsks");
  }
}

export class InvalidSerumOpenOrders extends Error {
  static readonly code = 6140;
  readonly code = 6140;
  readonly name = "InvalidSerumOpenOrders";
  readonly msg = "InvalidSerumOpenOrders";

  constructor(readonly logs?: string[]) {
    super("6140: InvalidSerumOpenOrders");
  }
}

export class FailedSerumCPI extends Error {
  static readonly code = 6141;
  readonly code = 6141;
  readonly name = "FailedSerumCPI";
  readonly msg = "FailedSerumCPI";

  constructor(readonly logs?: string[]) {
    super("6141: FailedSerumCPI");
  }
}

export class FailedToFillOnExternalMarket extends Error {
  static readonly code = 6142;
  readonly code = 6142;
  readonly name = "FailedToFillOnExternalMarket";
  readonly msg = "FailedToFillOnExternalMarket";

  constructor(readonly logs?: string[]) {
    super("6142: FailedToFillOnExternalMarket");
  }
}

export class InvalidFulfillmentConfig extends Error {
  static readonly code = 6143;
  readonly code = 6143;
  readonly name = "InvalidFulfillmentConfig";
  readonly msg = "InvalidFulfillmentConfig";

  constructor(readonly logs?: string[]) {
    super("6143: InvalidFulfillmentConfig");
  }
}

export class InvalidFeeStructure extends Error {
  static readonly code = 6144;
  readonly code = 6144;
  readonly name = "InvalidFeeStructure";
  readonly msg = "InvalidFeeStructure";

  constructor(readonly logs?: string[]) {
    super("6144: InvalidFeeStructure");
  }
}

export class InsufficientIFShares extends Error {
  static readonly code = 6145;
  readonly code = 6145;
  readonly name = "InsufficientIFShares";
  readonly msg = "Insufficient IF shares";

  constructor(readonly logs?: string[]) {
    super("6145: Insufficient IF shares");
  }
}

export class MarketActionPaused extends Error {
  static readonly code = 6146;
  readonly code = 6146;
  readonly name = "MarketActionPaused";
  readonly msg = "the Market has paused this action";

  constructor(readonly logs?: string[]) {
    super("6146: the Market has paused this action");
  }
}

export class MarketPlaceOrderPaused extends Error {
  static readonly code = 6147;
  readonly code = 6147;
  readonly name = "MarketPlaceOrderPaused";
  readonly msg = "the Market status doesnt allow placing orders";

  constructor(readonly logs?: string[]) {
    super("6147: the Market status doesnt allow placing orders");
  }
}

export class MarketFillOrderPaused extends Error {
  static readonly code = 6148;
  readonly code = 6148;
  readonly name = "MarketFillOrderPaused";
  readonly msg = "the Market status doesnt allow filling orders";

  constructor(readonly logs?: string[]) {
    super("6148: the Market status doesnt allow filling orders");
  }
}

export class MarketWithdrawPaused extends Error {
  static readonly code = 6149;
  readonly code = 6149;
  readonly name = "MarketWithdrawPaused";
  readonly msg = "the Market status doesnt allow withdraws";

  constructor(readonly logs?: string[]) {
    super("6149: the Market status doesnt allow withdraws");
  }
}

export class ProtectedAssetTierViolation extends Error {
  static readonly code = 6150;
  readonly code = 6150;
  readonly name = "ProtectedAssetTierViolation";
  readonly msg = "Action violates the Protected Asset Tier rules";

  constructor(readonly logs?: string[]) {
    super("6150: Action violates the Protected Asset Tier rules");
  }
}

export class IsolatedAssetTierViolation extends Error {
  static readonly code = 6151;
  readonly code = 6151;
  readonly name = "IsolatedAssetTierViolation";
  readonly msg = "Action violates the Isolated Asset Tier rules";

  constructor(readonly logs?: string[]) {
    super("6151: Action violates the Isolated Asset Tier rules");
  }
}

export class UserCantBeDeleted extends Error {
  static readonly code = 6152;
  readonly code = 6152;
  readonly name = "UserCantBeDeleted";
  readonly msg = "User Cant Be Deleted";

  constructor(readonly logs?: string[]) {
    super("6152: User Cant Be Deleted");
  }
}

export class ReduceOnlyWithdrawIncreasedRisk extends Error {
  static readonly code = 6153;
  readonly code = 6153;
  readonly name = "ReduceOnlyWithdrawIncreasedRisk";
  readonly msg = "Reduce Only Withdraw Increased Risk";

  constructor(readonly logs?: string[]) {
    super("6153: Reduce Only Withdraw Increased Risk");
  }
}

export class MaxOpenInterest extends Error {
  static readonly code = 6154;
  readonly code = 6154;
  readonly name = "MaxOpenInterest";
  readonly msg = "Max Open Interest";

  constructor(readonly logs?: string[]) {
    super("6154: Max Open Interest");
  }
}

export class CantResolvePerpBankruptcy extends Error {
  static readonly code = 6155;
  readonly code = 6155;
  readonly name = "CantResolvePerpBankruptcy";
  readonly msg = "Cant Resolve Perp Bankruptcy";

  constructor(readonly logs?: string[]) {
    super("6155: Cant Resolve Perp Bankruptcy");
  }
}

export class LiquidationDoesntSatisfyLimitPrice extends Error {
  static readonly code = 6156;
  readonly code = 6156;
  readonly name = "LiquidationDoesntSatisfyLimitPrice";
  readonly msg = "Liquidation Doesnt Satisfy Limit Price";

  constructor(readonly logs?: string[]) {
    super("6156: Liquidation Doesnt Satisfy Limit Price");
  }
}

export class MarginTradingDisabled extends Error {
  static readonly code = 6157;
  readonly code = 6157;
  readonly name = "MarginTradingDisabled";
  readonly msg = "Margin Trading Disabled";

  constructor(readonly logs?: string[]) {
    super("6157: Margin Trading Disabled");
  }
}

export class InvalidMarketStatusToSettlePnl extends Error {
  static readonly code = 6158;
  readonly code = 6158;
  readonly name = "InvalidMarketStatusToSettlePnl";
  readonly msg = "Invalid Market Status to Settle Perp Pnl";

  constructor(readonly logs?: string[]) {
    super("6158: Invalid Market Status to Settle Perp Pnl");
  }
}

export class PerpMarketNotInSettlement extends Error {
  static readonly code = 6159;
  readonly code = 6159;
  readonly name = "PerpMarketNotInSettlement";
  readonly msg = "PerpMarketNotInSettlement";

  constructor(readonly logs?: string[]) {
    super("6159: PerpMarketNotInSettlement");
  }
}

export class PerpMarketNotInReduceOnly extends Error {
  static readonly code = 6160;
  readonly code = 6160;
  readonly name = "PerpMarketNotInReduceOnly";
  readonly msg = "PerpMarketNotInReduceOnly";

  constructor(readonly logs?: string[]) {
    super("6160: PerpMarketNotInReduceOnly");
  }
}

export class PerpMarketSettlementBufferNotReached extends Error {
  static readonly code = 6161;
  readonly code = 6161;
  readonly name = "PerpMarketSettlementBufferNotReached";
  readonly msg = "PerpMarketSettlementBufferNotReached";

  constructor(readonly logs?: string[]) {
    super("6161: PerpMarketSettlementBufferNotReached");
  }
}

export class PerpMarketSettlementUserHasOpenOrders extends Error {
  static readonly code = 6162;
  readonly code = 6162;
  readonly name = "PerpMarketSettlementUserHasOpenOrders";
  readonly msg = "PerpMarketSettlementUserHasOpenOrders";

  constructor(readonly logs?: string[]) {
    super("6162: PerpMarketSettlementUserHasOpenOrders");
  }
}

export class PerpMarketSettlementUserHasActiveLP extends Error {
  static readonly code = 6163;
  readonly code = 6163;
  readonly name = "PerpMarketSettlementUserHasActiveLP";
  readonly msg = "PerpMarketSettlementUserHasActiveLP";

  constructor(readonly logs?: string[]) {
    super("6163: PerpMarketSettlementUserHasActiveLP");
  }
}

export class UnableToSettleExpiredUserPosition extends Error {
  static readonly code = 6164;
  readonly code = 6164;
  readonly name = "UnableToSettleExpiredUserPosition";
  readonly msg = "UnableToSettleExpiredUserPosition";

  constructor(readonly logs?: string[]) {
    super("6164: UnableToSettleExpiredUserPosition");
  }
}

export class UnequalMarketIndexForSpotTransfer extends Error {
  static readonly code = 6165;
  readonly code = 6165;
  readonly name = "UnequalMarketIndexForSpotTransfer";
  readonly msg = "UnequalMarketIndexForSpotTransfer";

  constructor(readonly logs?: string[]) {
    super("6165: UnequalMarketIndexForSpotTransfer");
  }
}

export class InvalidPerpPositionDetected extends Error {
  static readonly code = 6166;
  readonly code = 6166;
  readonly name = "InvalidPerpPositionDetected";
  readonly msg = "InvalidPerpPositionDetected";

  constructor(readonly logs?: string[]) {
    super("6166: InvalidPerpPositionDetected");
  }
}

export class InvalidSpotPositionDetected extends Error {
  static readonly code = 6167;
  readonly code = 6167;
  readonly name = "InvalidSpotPositionDetected";
  readonly msg = "InvalidSpotPositionDetected";

  constructor(readonly logs?: string[]) {
    super("6167: InvalidSpotPositionDetected");
  }
}

export class InvalidAmmDetected extends Error {
  static readonly code = 6168;
  readonly code = 6168;
  readonly name = "InvalidAmmDetected";
  readonly msg = "InvalidAmmDetected";

  constructor(readonly logs?: string[]) {
    super("6168: InvalidAmmDetected");
  }
}

export class InvalidAmmForFillDetected extends Error {
  static readonly code = 6169;
  readonly code = 6169;
  readonly name = "InvalidAmmForFillDetected";
  readonly msg = "InvalidAmmForFillDetected";

  constructor(readonly logs?: string[]) {
    super("6169: InvalidAmmForFillDetected");
  }
}

export class InvalidAmmLimitPriceOverride extends Error {
  static readonly code = 6170;
  readonly code = 6170;
  readonly name = "InvalidAmmLimitPriceOverride";
  readonly msg = "InvalidAmmLimitPriceOverride";

  constructor(readonly logs?: string[]) {
    super("6170: InvalidAmmLimitPriceOverride");
  }
}

export class InvalidOrderFillPrice extends Error {
  static readonly code = 6171;
  readonly code = 6171;
  readonly name = "InvalidOrderFillPrice";
  readonly msg = "InvalidOrderFillPrice";

  constructor(readonly logs?: string[]) {
    super("6171: InvalidOrderFillPrice");
  }
}

export class SpotMarketBalanceInvariantViolated extends Error {
  static readonly code = 6172;
  readonly code = 6172;
  readonly name = "SpotMarketBalanceInvariantViolated";
  readonly msg = "SpotMarketBalanceInvariantViolated";

  constructor(readonly logs?: string[]) {
    super("6172: SpotMarketBalanceInvariantViolated");
  }
}

export class SpotMarketVaultInvariantViolated extends Error {
  static readonly code = 6173;
  readonly code = 6173;
  readonly name = "SpotMarketVaultInvariantViolated";
  readonly msg = "SpotMarketVaultInvariantViolated";

  constructor(readonly logs?: string[]) {
    super("6173: SpotMarketVaultInvariantViolated");
  }
}

export class InvalidPDA extends Error {
  static readonly code = 6174;
  readonly code = 6174;
  readonly name = "InvalidPDA";
  readonly msg = "InvalidPDA";

  constructor(readonly logs?: string[]) {
    super("6174: InvalidPDA");
  }
}

export class InvalidPDASigner extends Error {
  static readonly code = 6175;
  readonly code = 6175;
  readonly name = "InvalidPDASigner";
  readonly msg = "InvalidPDASigner";

  constructor(readonly logs?: string[]) {
    super("6175: InvalidPDASigner");
  }
}

export class RevenueSettingsCannotSettleToIF extends Error {
  static readonly code = 6176;
  readonly code = 6176;
  readonly name = "RevenueSettingsCannotSettleToIF";
  readonly msg = "RevenueSettingsCannotSettleToIF";

  constructor(readonly logs?: string[]) {
    super("6176: RevenueSettingsCannotSettleToIF");
  }
}

export class NoRevenueToSettleToIF extends Error {
  static readonly code = 6177;
  readonly code = 6177;
  readonly name = "NoRevenueToSettleToIF";
  readonly msg = "NoRevenueToSettleToIF";

  constructor(readonly logs?: string[]) {
    super("6177: NoRevenueToSettleToIF");
  }
}

export class NoAmmPerpPnlDeficit extends Error {
  static readonly code = 6178;
  readonly code = 6178;
  readonly name = "NoAmmPerpPnlDeficit";
  readonly msg = "NoAmmPerpPnlDeficit";

  constructor(readonly logs?: string[]) {
    super("6178: NoAmmPerpPnlDeficit");
  }
}

export class SufficientPerpPnlPool extends Error {
  static readonly code = 6179;
  readonly code = 6179;
  readonly name = "SufficientPerpPnlPool";
  readonly msg = "SufficientPerpPnlPool";

  constructor(readonly logs?: string[]) {
    super("6179: SufficientPerpPnlPool");
  }
}

export class InsufficientPerpPnlPool extends Error {
  static readonly code = 6180;
  readonly code = 6180;
  readonly name = "InsufficientPerpPnlPool";
  readonly msg = "InsufficientPerpPnlPool";

  constructor(readonly logs?: string[]) {
    super("6180: InsufficientPerpPnlPool");
  }
}

export class PerpPnlDeficitBelowThreshold extends Error {
  static readonly code = 6181;
  readonly code = 6181;
  readonly name = "PerpPnlDeficitBelowThreshold";
  readonly msg = "PerpPnlDeficitBelowThreshold";

  constructor(readonly logs?: string[]) {
    super("6181: PerpPnlDeficitBelowThreshold");
  }
}

export class MaxRevenueWithdrawPerPeriodReached extends Error {
  static readonly code = 6182;
  readonly code = 6182;
  readonly name = "MaxRevenueWithdrawPerPeriodReached";
  readonly msg = "MaxRevenueWithdrawPerPeriodReached";

  constructor(readonly logs?: string[]) {
    super("6182: MaxRevenueWithdrawPerPeriodReached");
  }
}

export class MaxIFWithdrawReached extends Error {
  static readonly code = 6183;
  readonly code = 6183;
  readonly name = "MaxIFWithdrawReached";
  readonly msg = "InvalidSpotPositionDetected";

  constructor(readonly logs?: string[]) {
    super("6183: InvalidSpotPositionDetected");
  }
}

export class NoIFWithdrawAvailable extends Error {
  static readonly code = 6184;
  readonly code = 6184;
  readonly name = "NoIFWithdrawAvailable";
  readonly msg = "NoIFWithdrawAvailable";

  constructor(readonly logs?: string[]) {
    super("6184: NoIFWithdrawAvailable");
  }
}

export class InvalidIFUnstake extends Error {
  static readonly code = 6185;
  readonly code = 6185;
  readonly name = "InvalidIFUnstake";
  readonly msg = "InvalidIFUnstake";

  constructor(readonly logs?: string[]) {
    super("6185: InvalidIFUnstake");
  }
}

export class InvalidIFUnstakeSize extends Error {
  static readonly code = 6186;
  readonly code = 6186;
  readonly name = "InvalidIFUnstakeSize";
  readonly msg = "InvalidIFUnstakeSize";

  constructor(readonly logs?: string[]) {
    super("6186: InvalidIFUnstakeSize");
  }
}

export class InvalidIFUnstakeCancel extends Error {
  static readonly code = 6187;
  readonly code = 6187;
  readonly name = "InvalidIFUnstakeCancel";
  readonly msg = "InvalidIFUnstakeCancel";

  constructor(readonly logs?: string[]) {
    super("6187: InvalidIFUnstakeCancel");
  }
}

export class InvalidIFForNewStakes extends Error {
  static readonly code = 6188;
  readonly code = 6188;
  readonly name = "InvalidIFForNewStakes";
  readonly msg = "InvalidIFForNewStakes";

  constructor(readonly logs?: string[]) {
    super("6188: InvalidIFForNewStakes");
  }
}

export class InvalidIFRebase extends Error {
  static readonly code = 6189;
  readonly code = 6189;
  readonly name = "InvalidIFRebase";
  readonly msg = "InvalidIFRebase";

  constructor(readonly logs?: string[]) {
    super("6189: InvalidIFRebase");
  }
}

export class InvalidInsuranceUnstakeSize extends Error {
  static readonly code = 6190;
  readonly code = 6190;
  readonly name = "InvalidInsuranceUnstakeSize";
  readonly msg = "InvalidInsuranceUnstakeSize";

  constructor(readonly logs?: string[]) {
    super("6190: InvalidInsuranceUnstakeSize");
  }
}

export class InvalidOrderLimitPrice extends Error {
  static readonly code = 6191;
  readonly code = 6191;
  readonly name = "InvalidOrderLimitPrice";
  readonly msg = "InvalidOrderLimitPrice";

  constructor(readonly logs?: string[]) {
    super("6191: InvalidOrderLimitPrice");
  }
}

export class InvalidIFDetected extends Error {
  static readonly code = 6192;
  readonly code = 6192;
  readonly name = "InvalidIFDetected";
  readonly msg = "InvalidIFDetected";

  constructor(readonly logs?: string[]) {
    super("6192: InvalidIFDetected");
  }
}

export class InvalidAmmMaxSpreadDetected extends Error {
  static readonly code = 6193;
  readonly code = 6193;
  readonly name = "InvalidAmmMaxSpreadDetected";
  readonly msg = "InvalidAmmMaxSpreadDetected";

  constructor(readonly logs?: string[]) {
    super("6193: InvalidAmmMaxSpreadDetected");
  }
}

export class InvalidConcentrationCoef extends Error {
  static readonly code = 6194;
  readonly code = 6194;
  readonly name = "InvalidConcentrationCoef";
  readonly msg = "InvalidConcentrationCoef";

  constructor(readonly logs?: string[]) {
    super("6194: InvalidConcentrationCoef");
  }
}

export class InvalidSrmVault extends Error {
  static readonly code = 6195;
  readonly code = 6195;
  readonly name = "InvalidSrmVault";
  readonly msg = "InvalidSrmVault";

  constructor(readonly logs?: string[]) {
    super("6195: InvalidSrmVault");
  }
}

export class InvalidVaultOwner extends Error {
  static readonly code = 6196;
  readonly code = 6196;
  readonly name = "InvalidVaultOwner";
  readonly msg = "InvalidVaultOwner";

  constructor(readonly logs?: string[]) {
    super("6196: InvalidVaultOwner");
  }
}

export class InvalidMarketStatusForFills extends Error {
  static readonly code = 6197;
  readonly code = 6197;
  readonly name = "InvalidMarketStatusForFills";
  readonly msg = "InvalidMarketStatusForFills";

  constructor(readonly logs?: string[]) {
    super("6197: InvalidMarketStatusForFills");
  }
}

export class IFWithdrawRequestInProgress extends Error {
  static readonly code = 6198;
  readonly code = 6198;
  readonly name = "IFWithdrawRequestInProgress";
  readonly msg = "IFWithdrawRequestInProgress";

  constructor(readonly logs?: string[]) {
    super("6198: IFWithdrawRequestInProgress");
  }
}

export class NoIFWithdrawRequestInProgress extends Error {
  static readonly code = 6199;
  readonly code = 6199;
  readonly name = "NoIFWithdrawRequestInProgress";
  readonly msg = "NoIFWithdrawRequestInProgress";

  constructor(readonly logs?: string[]) {
    super("6199: NoIFWithdrawRequestInProgress");
  }
}

export class IFWithdrawRequestTooSmall extends Error {
  static readonly code = 6200;
  readonly code = 6200;
  readonly name = "IFWithdrawRequestTooSmall";
  readonly msg = "IFWithdrawRequestTooSmall";

  constructor(readonly logs?: string[]) {
    super("6200: IFWithdrawRequestTooSmall");
  }
}

export class IncorrectSpotMarketAccountPassed extends Error {
  static readonly code = 6201;
  readonly code = 6201;
  readonly name = "IncorrectSpotMarketAccountPassed";
  readonly msg = "IncorrectSpotMarketAccountPassed";

  constructor(readonly logs?: string[]) {
    super("6201: IncorrectSpotMarketAccountPassed");
  }
}

export class BlockchainClockInconsistency extends Error {
  static readonly code = 6202;
  readonly code = 6202;
  readonly name = "BlockchainClockInconsistency";
  readonly msg = "BlockchainClockInconsistency";

  constructor(readonly logs?: string[]) {
    super("6202: BlockchainClockInconsistency");
  }
}

export class InvalidIFSharesDetected extends Error {
  static readonly code = 6203;
  readonly code = 6203;
  readonly name = "InvalidIFSharesDetected";
  readonly msg = "InvalidIFSharesDetected";

  constructor(readonly logs?: string[]) {
    super("6203: InvalidIFSharesDetected");
  }
}

export class NewLPSizeTooSmall extends Error {
  static readonly code = 6204;
  readonly code = 6204;
  readonly name = "NewLPSizeTooSmall";
  readonly msg = "NewLPSizeTooSmall";

  constructor(readonly logs?: string[]) {
    super("6204: NewLPSizeTooSmall");
  }
}

export class MarketStatusInvalidForNewLP extends Error {
  static readonly code = 6205;
  readonly code = 6205;
  readonly name = "MarketStatusInvalidForNewLP";
  readonly msg = "MarketStatusInvalidForNewLP";

  constructor(readonly logs?: string[]) {
    super("6205: MarketStatusInvalidForNewLP");
  }
}

export class InvalidMarkTwapUpdateDetected extends Error {
  static readonly code = 6206;
  readonly code = 6206;
  readonly name = "InvalidMarkTwapUpdateDetected";
  readonly msg = "InvalidMarkTwapUpdateDetected";

  constructor(readonly logs?: string[]) {
    super("6206: InvalidMarkTwapUpdateDetected");
  }
}

export class MarketSettlementAttemptOnActiveMarket extends Error {
  static readonly code = 6207;
  readonly code = 6207;
  readonly name = "MarketSettlementAttemptOnActiveMarket";
  readonly msg = "MarketSettlementAttemptOnActiveMarket";

  constructor(readonly logs?: string[]) {
    super("6207: MarketSettlementAttemptOnActiveMarket");
  }
}

export class MarketSettlementRequiresSettledLP extends Error {
  static readonly code = 6208;
  readonly code = 6208;
  readonly name = "MarketSettlementRequiresSettledLP";
  readonly msg = "MarketSettlementRequiresSettledLP";

  constructor(readonly logs?: string[]) {
    super("6208: MarketSettlementRequiresSettledLP");
  }
}

export class MarketSettlementAttemptTooEarly extends Error {
  static readonly code = 6209;
  readonly code = 6209;
  readonly name = "MarketSettlementAttemptTooEarly";
  readonly msg = "MarketSettlementAttemptTooEarly";

  constructor(readonly logs?: string[]) {
    super("6209: MarketSettlementAttemptTooEarly");
  }
}

export class MarketSettlementTargetPriceInvalid extends Error {
  static readonly code = 6210;
  readonly code = 6210;
  readonly name = "MarketSettlementTargetPriceInvalid";
  readonly msg = "MarketSettlementTargetPriceInvalid";

  constructor(readonly logs?: string[]) {
    super("6210: MarketSettlementTargetPriceInvalid");
  }
}

export class UnsupportedSpotMarket extends Error {
  static readonly code = 6211;
  readonly code = 6211;
  readonly name = "UnsupportedSpotMarket";
  readonly msg = "UnsupportedSpotMarket";

  constructor(readonly logs?: string[]) {
    super("6211: UnsupportedSpotMarket");
  }
}

export class SpotOrdersDisabled extends Error {
  static readonly code = 6212;
  readonly code = 6212;
  readonly name = "SpotOrdersDisabled";
  readonly msg = "SpotOrdersDisabled";

  constructor(readonly logs?: string[]) {
    super("6212: SpotOrdersDisabled");
  }
}

export class MarketBeingInitialized extends Error {
  static readonly code = 6213;
  readonly code = 6213;
  readonly name = "MarketBeingInitialized";
  readonly msg = "Market Being Initialized";

  constructor(readonly logs?: string[]) {
    super("6213: Market Being Initialized");
  }
}

export class InvalidUserSubAccountId extends Error {
  static readonly code = 6214;
  readonly code = 6214;
  readonly name = "InvalidUserSubAccountId";
  readonly msg = "Invalid Sub Account Id";

  constructor(readonly logs?: string[]) {
    super("6214: Invalid Sub Account Id");
  }
}

export class InvalidTriggerOrderCondition extends Error {
  static readonly code = 6215;
  readonly code = 6215;
  readonly name = "InvalidTriggerOrderCondition";
  readonly msg = "Invalid Trigger Order Condition";

  constructor(readonly logs?: string[]) {
    super("6215: Invalid Trigger Order Condition");
  }
}

export class InvalidSpotPosition extends Error {
  static readonly code = 6216;
  readonly code = 6216;
  readonly name = "InvalidSpotPosition";
  readonly msg = "Invalid Spot Position";

  constructor(readonly logs?: string[]) {
    super("6216: Invalid Spot Position");
  }
}

export class CantTransferBetweenSameUserAccount extends Error {
  static readonly code = 6217;
  readonly code = 6217;
  readonly name = "CantTransferBetweenSameUserAccount";
  readonly msg = "Cant transfer between same user account";

  constructor(readonly logs?: string[]) {
    super("6217: Cant transfer between same user account");
  }
}

export class InvalidPerpPosition extends Error {
  static readonly code = 6218;
  readonly code = 6218;
  readonly name = "InvalidPerpPosition";
  readonly msg = "Invalid Perp Position";

  constructor(readonly logs?: string[]) {
    super("6218: Invalid Perp Position");
  }
}

export class UnableToGetLimitPrice extends Error {
  static readonly code = 6219;
  readonly code = 6219;
  readonly name = "UnableToGetLimitPrice";
  readonly msg = "Unable To Get Limit Price";

  constructor(readonly logs?: string[]) {
    super("6219: Unable To Get Limit Price");
  }
}

export class InvalidLiquidation extends Error {
  static readonly code = 6220;
  readonly code = 6220;
  readonly name = "InvalidLiquidation";
  readonly msg = "Invalid Liquidation";

  constructor(readonly logs?: string[]) {
    super("6220: Invalid Liquidation");
  }
}

export class SpotFulfillmentConfigDisabled extends Error {
  static readonly code = 6221;
  readonly code = 6221;
  readonly name = "SpotFulfillmentConfigDisabled";
  readonly msg = "Spot Fulfillment Config Disabled";

  constructor(readonly logs?: string[]) {
    super("6221: Spot Fulfillment Config Disabled");
  }
}

export class InvalidMaker extends Error {
  static readonly code = 6222;
  readonly code = 6222;
  readonly name = "InvalidMaker";
  readonly msg = "Invalid Maker";

  constructor(readonly logs?: string[]) {
    super("6222: Invalid Maker");
  }
}

export class FailedUnwrap extends Error {
  static readonly code = 6223;
  readonly code = 6223;
  readonly name = "FailedUnwrap";
  readonly msg = "Failed Unwrap";

  constructor(readonly logs?: string[]) {
    super("6223: Failed Unwrap");
  }
}

export class MaxNumberOfUsers extends Error {
  static readonly code = 6224;
  readonly code = 6224;
  readonly name = "MaxNumberOfUsers";
  readonly msg = "Max Number Of Users";

  constructor(readonly logs?: string[]) {
    super("6224: Max Number Of Users");
  }
}

export class InvalidOracleForSettlePnl extends Error {
  static readonly code = 6225;
  readonly code = 6225;
  readonly name = "InvalidOracleForSettlePnl";
  readonly msg = "InvalidOracleForSettlePnl";

  constructor(readonly logs?: string[]) {
    super("6225: InvalidOracleForSettlePnl");
  }
}

export class MarginOrdersOpen extends Error {
  static readonly code = 6226;
  readonly code = 6226;
  readonly name = "MarginOrdersOpen";
  readonly msg = "MarginOrdersOpen";

  constructor(readonly logs?: string[]) {
    super("6226: MarginOrdersOpen");
  }
}

export class TierViolationLiquidatingPerpPnl extends Error {
  static readonly code = 6227;
  readonly code = 6227;
  readonly name = "TierViolationLiquidatingPerpPnl";
  readonly msg = "TierViolationLiquidatingPerpPnl";

  constructor(readonly logs?: string[]) {
    super("6227: TierViolationLiquidatingPerpPnl");
  }
}

export class CouldNotLoadUserData extends Error {
  static readonly code = 6228;
  readonly code = 6228;
  readonly name = "CouldNotLoadUserData";
  readonly msg = "CouldNotLoadUserData";

  constructor(readonly logs?: string[]) {
    super("6228: CouldNotLoadUserData");
  }
}

export class UserWrongMutability extends Error {
  static readonly code = 6229;
  readonly code = 6229;
  readonly name = "UserWrongMutability";
  readonly msg = "UserWrongMutability";

  constructor(readonly logs?: string[]) {
    super("6229: UserWrongMutability");
  }
}

export class InvalidUserAccount extends Error {
  static readonly code = 6230;
  readonly code = 6230;
  readonly name = "InvalidUserAccount";
  readonly msg = "InvalidUserAccount";

  constructor(readonly logs?: string[]) {
    super("6230: InvalidUserAccount");
  }
}

export class CouldNotLoadUserStatsData extends Error {
  static readonly code = 6231;
  readonly code = 6231;
  readonly name = "CouldNotLoadUserStatsData";
  readonly msg = "CouldNotLoadUserData";

  constructor(readonly logs?: string[]) {
    super("6231: CouldNotLoadUserData");
  }
}

export class UserStatsWrongMutability extends Error {
  static readonly code = 6232;
  readonly code = 6232;
  readonly name = "UserStatsWrongMutability";
  readonly msg = "UserWrongMutability";

  constructor(readonly logs?: string[]) {
    super("6232: UserWrongMutability");
  }
}

export class InvalidUserStatsAccount extends Error {
  static readonly code = 6233;
  readonly code = 6233;
  readonly name = "InvalidUserStatsAccount";
  readonly msg = "InvalidUserAccount";

  constructor(readonly logs?: string[]) {
    super("6233: InvalidUserAccount");
  }
}

export class UserNotFound extends Error {
  static readonly code = 6234;
  readonly code = 6234;
  readonly name = "UserNotFound";
  readonly msg = "UserNotFound";

  constructor(readonly logs?: string[]) {
    super("6234: UserNotFound");
  }
}

export class UnableToLoadUserAccount extends Error {
  static readonly code = 6235;
  readonly code = 6235;
  readonly name = "UnableToLoadUserAccount";
  readonly msg = "UnableToLoadUserAccount";

  constructor(readonly logs?: string[]) {
    super("6235: UnableToLoadUserAccount");
  }
}

export class UserStatsNotFound extends Error {
  static readonly code = 6236;
  readonly code = 6236;
  readonly name = "UserStatsNotFound";
  readonly msg = "UserStatsNotFound";

  constructor(readonly logs?: string[]) {
    super("6236: UserStatsNotFound");
  }
}

export class UnableToLoadUserStatsAccount extends Error {
  static readonly code = 6237;
  readonly code = 6237;
  readonly name = "UnableToLoadUserStatsAccount";
  readonly msg = "UnableToLoadUserStatsAccount";

  constructor(readonly logs?: string[]) {
    super("6237: UnableToLoadUserStatsAccount");
  }
}

export class UserNotInactive extends Error {
  static readonly code = 6238;
  readonly code = 6238;
  readonly name = "UserNotInactive";
  readonly msg = "User Not Inactive";

  constructor(readonly logs?: string[]) {
    super("6238: User Not Inactive");
  }
}

export class RevertFill extends Error {
  static readonly code = 6239;
  readonly code = 6239;
  readonly name = "RevertFill";
  readonly msg = "RevertFill";

  constructor(readonly logs?: string[]) {
    super("6239: RevertFill");
  }
}

export class InvalidMarketAccountforDeletion extends Error {
  static readonly code = 6240;
  readonly code = 6240;
  readonly name = "InvalidMarketAccountforDeletion";
  readonly msg = "Invalid MarketAccount for Deletion";

  constructor(readonly logs?: string[]) {
    super("6240: Invalid MarketAccount for Deletion");
  }
}

export class InvalidSpotFulfillmentParams extends Error {
  static readonly code = 6241;
  readonly code = 6241;
  readonly name = "InvalidSpotFulfillmentParams";
  readonly msg = "Invalid Spot Fulfillment Params";

  constructor(readonly logs?: string[]) {
    super("6241: Invalid Spot Fulfillment Params");
  }
}

export class FailedToGetMint extends Error {
  static readonly code = 6242;
  readonly code = 6242;
  readonly name = "FailedToGetMint";
  readonly msg = "Failed to Get Mint";

  constructor(readonly logs?: string[]) {
    super("6242: Failed to Get Mint");
  }
}

export class FailedPhoenixCPI extends Error {
  static readonly code = 6243;
  readonly code = 6243;
  readonly name = "FailedPhoenixCPI";
  readonly msg = "FailedPhoenixCPI";

  constructor(readonly logs?: string[]) {
    super("6243: FailedPhoenixCPI");
  }
}

export class FailedToDeserializePhoenixMarket extends Error {
  static readonly code = 6244;
  readonly code = 6244;
  readonly name = "FailedToDeserializePhoenixMarket";
  readonly msg = "FailedToDeserializePhoenixMarket";

  constructor(readonly logs?: string[]) {
    super("6244: FailedToDeserializePhoenixMarket");
  }
}

export class InvalidPricePrecision extends Error {
  static readonly code = 6245;
  readonly code = 6245;
  readonly name = "InvalidPricePrecision";
  readonly msg = "InvalidPricePrecision";

  constructor(readonly logs?: string[]) {
    super("6245: InvalidPricePrecision");
  }
}

export class InvalidPhoenixProgram extends Error {
  static readonly code = 6246;
  readonly code = 6246;
  readonly name = "InvalidPhoenixProgram";
  readonly msg = "InvalidPhoenixProgram";

  constructor(readonly logs?: string[]) {
    super("6246: InvalidPhoenixProgram");
  }
}

export class InvalidPhoenixMarket extends Error {
  static readonly code = 6247;
  readonly code = 6247;
  readonly name = "InvalidPhoenixMarket";
  readonly msg = "InvalidPhoenixMarket";

  constructor(readonly logs?: string[]) {
    super("6247: InvalidPhoenixMarket");
  }
}

export class InvalidSwap extends Error {
  static readonly code = 6248;
  readonly code = 6248;
  readonly name = "InvalidSwap";
  readonly msg = "InvalidSwap";

  constructor(readonly logs?: string[]) {
    super("6248: InvalidSwap");
  }
}

export class SwapLimitPriceBreached extends Error {
  static readonly code = 6249;
  readonly code = 6249;
  readonly name = "SwapLimitPriceBreached";
  readonly msg = "SwapLimitPriceBreached";

  constructor(readonly logs?: string[]) {
    super("6249: SwapLimitPriceBreached");
  }
}

export class SpotMarketReduceOnly extends Error {
  static readonly code = 6250;
  readonly code = 6250;
  readonly name = "SpotMarketReduceOnly";
  readonly msg = "SpotMarketReduceOnly";

  constructor(readonly logs?: string[]) {
    super("6250: SpotMarketReduceOnly");
  }
}

export class FundingWasNotUpdated extends Error {
  static readonly code = 6251;
  readonly code = 6251;
  readonly name = "FundingWasNotUpdated";
  readonly msg = "FundingWasNotUpdated";

  constructor(readonly logs?: string[]) {
    super("6251: FundingWasNotUpdated");
  }
}

export class ImpossibleFill extends Error {
  static readonly code = 6252;
  readonly code = 6252;
  readonly name = "ImpossibleFill";
  readonly msg = "ImpossibleFill";

  constructor(readonly logs?: string[]) {
    super("6252: ImpossibleFill");
  }
}

export class CantUpdatePerpBidAskTwap extends Error {
  static readonly code = 6253;
  readonly code = 6253;
  readonly name = "CantUpdatePerpBidAskTwap";
  readonly msg = "CantUpdatePerpBidAskTwap";

  constructor(readonly logs?: string[]) {
    super("6253: CantUpdatePerpBidAskTwap");
  }
}

export class UserReduceOnly extends Error {
  static readonly code = 6254;
  readonly code = 6254;
  readonly name = "UserReduceOnly";
  readonly msg = "UserReduceOnly";

  constructor(readonly logs?: string[]) {
    super("6254: UserReduceOnly");
  }
}

export class InvalidMarginCalculation extends Error {
  static readonly code = 6255;
  readonly code = 6255;
  readonly name = "InvalidMarginCalculation";
  readonly msg = "InvalidMarginCalculation";

  constructor(readonly logs?: string[]) {
    super("6255: InvalidMarginCalculation");
  }
}

export class CantPayUserInitFee extends Error {
  static readonly code = 6256;
  readonly code = 6256;
  readonly name = "CantPayUserInitFee";
  readonly msg = "CantPayUserInitFee";

  constructor(readonly logs?: string[]) {
    super("6256: CantPayUserInitFee");
  }
}

export class CantReclaimRent extends Error {
  static readonly code = 6257;
  readonly code = 6257;
  readonly name = "CantReclaimRent";
  readonly msg = "CantReclaimRent";

  constructor(readonly logs?: string[]) {
    super("6257: CantReclaimRent");
  }
}

export class InsuranceFundOperationPaused extends Error {
  static readonly code = 6258;
  readonly code = 6258;
  readonly name = "InsuranceFundOperationPaused";
  readonly msg = "InsuranceFundOperationPaused";

  constructor(readonly logs?: string[]) {
    super("6258: InsuranceFundOperationPaused");
  }
}

export class NoUnsettledPnl extends Error {
  static readonly code = 6259;
  readonly code = 6259;
  readonly name = "NoUnsettledPnl";
  readonly msg = "NoUnsettledPnl";

  constructor(readonly logs?: string[]) {
    super("6259: NoUnsettledPnl");
  }
}

export class PnlPoolCantSettleUser extends Error {
  static readonly code = 6260;
  readonly code = 6260;
  readonly name = "PnlPoolCantSettleUser";
  readonly msg = "PnlPoolCantSettleUser";

  constructor(readonly logs?: string[]) {
    super("6260: PnlPoolCantSettleUser");
  }
}

export class OracleNonPositive extends Error {
  static readonly code = 6261;
  readonly code = 6261;
  readonly name = "OracleNonPositive";
  readonly msg = "OracleInvalid";

  constructor(readonly logs?: string[]) {
    super("6261: OracleInvalid");
  }
}

export class OracleTooVolatile extends Error {
  static readonly code = 6262;
  readonly code = 6262;
  readonly name = "OracleTooVolatile";
  readonly msg = "OracleTooVolatile";

  constructor(readonly logs?: string[]) {
    super("6262: OracleTooVolatile");
  }
}

export class OracleTooUncertain extends Error {
  static readonly code = 6263;
  readonly code = 6263;
  readonly name = "OracleTooUncertain";
  readonly msg = "OracleTooUncertain";

  constructor(readonly logs?: string[]) {
    super("6263: OracleTooUncertain");
  }
}

export class OracleStaleForMargin extends Error {
  static readonly code = 6264;
  readonly code = 6264;
  readonly name = "OracleStaleForMargin";
  readonly msg = "OracleStaleForMargin";

  constructor(readonly logs?: string[]) {
    super("6264: OracleStaleForMargin");
  }
}

export class OracleInsufficientDataPoints extends Error {
  static readonly code = 6265;
  readonly code = 6265;
  readonly name = "OracleInsufficientDataPoints";
  readonly msg = "OracleInsufficientDataPoints";

  constructor(readonly logs?: string[]) {
    super("6265: OracleInsufficientDataPoints");
  }
}

export class OracleStaleForAMM extends Error {
  static readonly code = 6266;
  readonly code = 6266;
  readonly name = "OracleStaleForAMM";
  readonly msg = "OracleStaleForAMM";

  constructor(readonly logs?: string[]) {
    super("6266: OracleStaleForAMM");
  }
}

export class UnableToParsePullOracleMessage extends Error {
  static readonly code = 6267;
  readonly code = 6267;
  readonly name = "UnableToParsePullOracleMessage";
  readonly msg = "Unable to parse pull oracle message";

  constructor(readonly logs?: string[]) {
    super("6267: Unable to parse pull oracle message");
  }
}

export class MaxBorrows extends Error {
  static readonly code = 6268;
  readonly code = 6268;
  readonly name = "MaxBorrows";
  readonly msg = "Can not borow more than max borrows";

  constructor(readonly logs?: string[]) {
    super("6268: Can not borow more than max borrows");
  }
}

export class OracleUpdatesNotMonotonic extends Error {
  static readonly code = 6269;
  readonly code = 6269;
  readonly name = "OracleUpdatesNotMonotonic";
  readonly msg = "Updates must be monotonically increasing";

  constructor(readonly logs?: string[]) {
    super("6269: Updates must be monotonically increasing");
  }
}

export class OraclePriceFeedMessageMismatch extends Error {
  static readonly code = 6270;
  readonly code = 6270;
  readonly name = "OraclePriceFeedMessageMismatch";
  readonly msg = "Trying to update price feed with the wrong feed id";

  constructor(readonly logs?: string[]) {
    super("6270: Trying to update price feed with the wrong feed id");
  }
}

export class OracleUnsupportedMessageType extends Error {
  static readonly code = 6271;
  readonly code = 6271;
  readonly name = "OracleUnsupportedMessageType";
  readonly msg = "The message in the update must be a PriceFeedMessage";

  constructor(readonly logs?: string[]) {
    super("6271: The message in the update must be a PriceFeedMessage");
  }
}

export class OracleDeserializeMessageFailed extends Error {
  static readonly code = 6272;
  readonly code = 6272;
  readonly name = "OracleDeserializeMessageFailed";
  readonly msg = "Could not deserialize the message in the update";

  constructor(readonly logs?: string[]) {
    super("6272: Could not deserialize the message in the update");
  }
}

export class OracleWrongGuardianSetOwner extends Error {
  static readonly code = 6273;
  readonly code = 6273;
  readonly name = "OracleWrongGuardianSetOwner";
  readonly msg = "Wrong guardian set owner in update price atomic";

  constructor(readonly logs?: string[]) {
    super("6273: Wrong guardian set owner in update price atomic");
  }
}

export class OracleWrongWriteAuthority extends Error {
  static readonly code = 6274;
  readonly code = 6274;
  readonly name = "OracleWrongWriteAuthority";
  readonly msg =
    "Oracle post update atomic price feed account must be drift program";

  constructor(readonly logs?: string[]) {
    super(
      "6274: Oracle post update atomic price feed account must be drift program"
    );
  }
}

export class OracleWrongVaaOwner extends Error {
  static readonly code = 6275;
  readonly code = 6275;
  readonly name = "OracleWrongVaaOwner";
  readonly msg = "Oracle vaa owner must be wormhole program";

  constructor(readonly logs?: string[]) {
    super("6275: Oracle vaa owner must be wormhole program");
  }
}

export class OracleTooManyPriceAccountUpdates extends Error {
  static readonly code = 6276;
  readonly code = 6276;
  readonly name = "OracleTooManyPriceAccountUpdates";
  readonly msg =
    "Multi updates must have 2 or fewer accounts passed in remaining accounts";

  constructor(readonly logs?: string[]) {
    super(
      "6276: Multi updates must have 2 or fewer accounts passed in remaining accounts"
    );
  }
}

export class OracleMismatchedVaaAndPriceUpdates extends Error {
  static readonly code = 6277;
  readonly code = 6277;
  readonly name = "OracleMismatchedVaaAndPriceUpdates";
  readonly msg =
    "Don't have the same remaining accounts number and merkle price updates left";

  constructor(readonly logs?: string[]) {
    super(
      "6277: Don't have the same remaining accounts number and merkle price updates left"
    );
  }
}

export class OracleBadRemainingAccountPublicKey extends Error {
  static readonly code = 6278;
  readonly code = 6278;
  readonly name = "OracleBadRemainingAccountPublicKey";
  readonly msg = "Remaining account passed is not a valid pda";

  constructor(readonly logs?: string[]) {
    super("6278: Remaining account passed is not a valid pda");
  }
}

export class FailedOpenbookV2CPI extends Error {
  static readonly code = 6279;
  readonly code = 6279;
  readonly name = "FailedOpenbookV2CPI";
  readonly msg = "FailedOpenbookV2CPI";

  constructor(readonly logs?: string[]) {
    super("6279: FailedOpenbookV2CPI");
  }
}

export class InvalidOpenbookV2Program extends Error {
  static readonly code = 6280;
  readonly code = 6280;
  readonly name = "InvalidOpenbookV2Program";
  readonly msg = "InvalidOpenbookV2Program";

  constructor(readonly logs?: string[]) {
    super("6280: InvalidOpenbookV2Program");
  }
}

export class InvalidOpenbookV2Market extends Error {
  static readonly code = 6281;
  readonly code = 6281;
  readonly name = "InvalidOpenbookV2Market";
  readonly msg = "InvalidOpenbookV2Market";

  constructor(readonly logs?: string[]) {
    super("6281: InvalidOpenbookV2Market");
  }
}

export class NonZeroTransferFee extends Error {
  static readonly code = 6282;
  readonly code = 6282;
  readonly name = "NonZeroTransferFee";
  readonly msg = "Non zero transfer fee";

  constructor(readonly logs?: string[]) {
    super("6282: Non zero transfer fee");
  }
}

export class LiquidationOrderFailedToFill extends Error {
  static readonly code = 6283;
  readonly code = 6283;
  readonly name = "LiquidationOrderFailedToFill";
  readonly msg = "Liquidation order failed to fill";

  constructor(readonly logs?: string[]) {
    super("6283: Liquidation order failed to fill");
  }
}

export class InvalidPredictionMarketOrder extends Error {
  static readonly code = 6284;
  readonly code = 6284;
  readonly name = "InvalidPredictionMarketOrder";
  readonly msg = "Invalid prediction market order";

  constructor(readonly logs?: string[]) {
    super("6284: Invalid prediction market order");
  }
}

export class InvalidVerificationIxIndex extends Error {
  static readonly code = 6285;
  readonly code = 6285;
  readonly name = "InvalidVerificationIxIndex";
  readonly msg = "Ed25519 Ix must be before place and make swift order ix";

  constructor(readonly logs?: string[]) {
    super("6285: Ed25519 Ix must be before place and make swift order ix");
  }
}

export class SigVerificationFailed extends Error {
  static readonly code = 6286;
  readonly code = 6286;
  readonly name = "SigVerificationFailed";
  readonly msg = "Swift message verificaiton failed";

  constructor(readonly logs?: string[]) {
    super("6286: Swift message verificaiton failed");
  }
}

export class MismatchedSwiftOrderParamsMarketIndex extends Error {
  static readonly code = 6287;
  readonly code = 6287;
  readonly name = "MismatchedSwiftOrderParamsMarketIndex";
  readonly msg =
    "Market index mismatched b/w taker and maker swift order params";

  constructor(readonly logs?: string[]) {
    super(
      "6287: Market index mismatched b/w taker and maker swift order params"
    );
  }
}

export class InvalidSwiftOrderParam extends Error {
  static readonly code = 6288;
  readonly code = 6288;
  readonly name = "InvalidSwiftOrderParam";
  readonly msg = "Swift only available for market/oracle perp orders";

  constructor(readonly logs?: string[]) {
    super("6288: Swift only available for market/oracle perp orders");
  }
}

export class PlaceAndTakeOrderSuccessConditionFailed extends Error {
  static readonly code = 6289;
  readonly code = 6289;
  readonly name = "PlaceAndTakeOrderSuccessConditionFailed";
  readonly msg = "Place and take order success condition failed";

  constructor(readonly logs?: string[]) {
    super("6289: Place and take order success condition failed");
  }
}

export class InvalidHighLeverageModeConfig extends Error {
  static readonly code = 6290;
  readonly code = 6290;
  readonly name = "InvalidHighLeverageModeConfig";
  readonly msg = "Invalid High Leverage Mode Config";

  constructor(readonly logs?: string[]) {
    super("6290: Invalid High Leverage Mode Config");
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new InvalidSpotMarketAuthority(logs);
    case 6001:
      return new InvalidInsuranceFundAuthority(logs);
    case 6002:
      return new InsufficientDeposit(logs);
    case 6003:
      return new InsufficientCollateral(logs);
    case 6004:
      return new SufficientCollateral(logs);
    case 6005:
      return new MaxNumberOfPositions(logs);
    case 6006:
      return new AdminControlsPricesDisabled(logs);
    case 6007:
      return new MarketDelisted(logs);
    case 6008:
      return new MarketIndexAlreadyInitialized(logs);
    case 6009:
      return new UserAccountAndUserPositionsAccountMismatch(logs);
    case 6010:
      return new UserHasNoPositionInMarket(logs);
    case 6011:
      return new InvalidInitialPeg(logs);
    case 6012:
      return new InvalidRepegRedundant(logs);
    case 6013:
      return new InvalidRepegDirection(logs);
    case 6014:
      return new InvalidRepegProfitability(logs);
    case 6015:
      return new SlippageOutsideLimit(logs);
    case 6016:
      return new OrderSizeTooSmall(logs);
    case 6017:
      return new InvalidUpdateK(logs);
    case 6018:
      return new AdminWithdrawTooLarge(logs);
    case 6019:
      return new MathError(logs);
    case 6020:
      return new BnConversionError(logs);
    case 6021:
      return new ClockUnavailable(logs);
    case 6022:
      return new UnableToLoadOracle(logs);
    case 6023:
      return new PriceBandsBreached(logs);
    case 6024:
      return new ExchangePaused(logs);
    case 6025:
      return new InvalidWhitelistToken(logs);
    case 6026:
      return new WhitelistTokenNotFound(logs);
    case 6027:
      return new InvalidDiscountToken(logs);
    case 6028:
      return new DiscountTokenNotFound(logs);
    case 6029:
      return new ReferrerNotFound(logs);
    case 6030:
      return new ReferrerStatsNotFound(logs);
    case 6031:
      return new ReferrerMustBeWritable(logs);
    case 6032:
      return new ReferrerStatsMustBeWritable(logs);
    case 6033:
      return new ReferrerAndReferrerStatsAuthorityUnequal(logs);
    case 6034:
      return new InvalidReferrer(logs);
    case 6035:
      return new InvalidOracle(logs);
    case 6036:
      return new OracleNotFound(logs);
    case 6037:
      return new LiquidationsBlockedByOracle(logs);
    case 6038:
      return new MaxDeposit(logs);
    case 6039:
      return new CantDeleteUserWithCollateral(logs);
    case 6040:
      return new InvalidFundingProfitability(logs);
    case 6041:
      return new CastingFailure(logs);
    case 6042:
      return new InvalidOrder(logs);
    case 6043:
      return new InvalidOrderMaxTs(logs);
    case 6044:
      return new InvalidOrderMarketType(logs);
    case 6045:
      return new InvalidOrderForInitialMarginReq(logs);
    case 6046:
      return new InvalidOrderNotRiskReducing(logs);
    case 6047:
      return new InvalidOrderSizeTooSmall(logs);
    case 6048:
      return new InvalidOrderNotStepSizeMultiple(logs);
    case 6049:
      return new InvalidOrderBaseQuoteAsset(logs);
    case 6050:
      return new InvalidOrderIOC(logs);
    case 6051:
      return new InvalidOrderPostOnly(logs);
    case 6052:
      return new InvalidOrderIOCPostOnly(logs);
    case 6053:
      return new InvalidOrderTrigger(logs);
    case 6054:
      return new InvalidOrderAuction(logs);
    case 6055:
      return new InvalidOrderOracleOffset(logs);
    case 6056:
      return new InvalidOrderMinOrderSize(logs);
    case 6057:
      return new PlacePostOnlyLimitFailure(logs);
    case 6058:
      return new UserHasNoOrder(logs);
    case 6059:
      return new OrderAmountTooSmall(logs);
    case 6060:
      return new MaxNumberOfOrders(logs);
    case 6061:
      return new OrderDoesNotExist(logs);
    case 6062:
      return new OrderNotOpen(logs);
    case 6063:
      return new FillOrderDidNotUpdateState(logs);
    case 6064:
      return new ReduceOnlyOrderIncreasedRisk(logs);
    case 6065:
      return new UnableToLoadAccountLoader(logs);
    case 6066:
      return new TradeSizeTooLarge(logs);
    case 6067:
      return new UserCantReferThemselves(logs);
    case 6068:
      return new DidNotReceiveExpectedReferrer(logs);
    case 6069:
      return new CouldNotDeserializeReferrer(logs);
    case 6070:
      return new CouldNotDeserializeReferrerStats(logs);
    case 6071:
      return new UserOrderIdAlreadyInUse(logs);
    case 6072:
      return new NoPositionsLiquidatable(logs);
    case 6073:
      return new InvalidMarginRatio(logs);
    case 6074:
      return new CantCancelPostOnlyOrder(logs);
    case 6075:
      return new InvalidOracleOffset(logs);
    case 6076:
      return new CantExpireOrders(logs);
    case 6077:
      return new CouldNotLoadMarketData(logs);
    case 6078:
      return new PerpMarketNotFound(logs);
    case 6079:
      return new InvalidMarketAccount(logs);
    case 6080:
      return new UnableToLoadPerpMarketAccount(logs);
    case 6081:
      return new MarketWrongMutability(logs);
    case 6082:
      return new UnableToCastUnixTime(logs);
    case 6083:
      return new CouldNotFindSpotPosition(logs);
    case 6084:
      return new NoSpotPositionAvailable(logs);
    case 6085:
      return new InvalidSpotMarketInitialization(logs);
    case 6086:
      return new CouldNotLoadSpotMarketData(logs);
    case 6087:
      return new SpotMarketNotFound(logs);
    case 6088:
      return new InvalidSpotMarketAccount(logs);
    case 6089:
      return new UnableToLoadSpotMarketAccount(logs);
    case 6090:
      return new SpotMarketWrongMutability(logs);
    case 6091:
      return new SpotMarketInterestNotUpToDate(logs);
    case 6092:
      return new SpotMarketInsufficientDeposits(logs);
    case 6093:
      return new UserMustSettleTheirOwnPositiveUnsettledPNL(logs);
    case 6094:
      return new CantUpdatePoolBalanceType(logs);
    case 6095:
      return new InsufficientCollateralForSettlingPNL(logs);
    case 6096:
      return new AMMNotUpdatedInSameSlot(logs);
    case 6097:
      return new AuctionNotComplete(logs);
    case 6098:
      return new MakerNotFound(logs);
    case 6099:
      return new MakerStatsNotFound(logs);
    case 6100:
      return new MakerMustBeWritable(logs);
    case 6101:
      return new MakerStatsMustBeWritable(logs);
    case 6102:
      return new MakerOrderNotFound(logs);
    case 6103:
      return new CouldNotDeserializeMaker(logs);
    case 6104:
      return new CouldNotDeserializeMakerStats(logs);
    case 6105:
      return new AuctionPriceDoesNotSatisfyMaker(logs);
    case 6106:
      return new MakerCantFulfillOwnOrder(logs);
    case 6107:
      return new MakerOrderMustBePostOnly(logs);
    case 6108:
      return new CantMatchTwoPostOnlys(logs);
    case 6109:
      return new OrderBreachesOraclePriceLimits(logs);
    case 6110:
      return new OrderMustBeTriggeredFirst(logs);
    case 6111:
      return new OrderNotTriggerable(logs);
    case 6112:
      return new OrderDidNotSatisfyTriggerCondition(logs);
    case 6113:
      return new PositionAlreadyBeingLiquidated(logs);
    case 6114:
      return new PositionDoesntHaveOpenPositionOrOrders(logs);
    case 6115:
      return new AllOrdersAreAlreadyLiquidations(logs);
    case 6116:
      return new CantCancelLiquidationOrder(logs);
    case 6117:
      return new UserIsBeingLiquidated(logs);
    case 6118:
      return new LiquidationsOngoing(logs);
    case 6119:
      return new WrongSpotBalanceType(logs);
    case 6120:
      return new UserCantLiquidateThemself(logs);
    case 6121:
      return new InvalidPerpPositionToLiquidate(logs);
    case 6122:
      return new InvalidBaseAssetAmountForLiquidatePerp(logs);
    case 6123:
      return new InvalidPositionLastFundingRate(logs);
    case 6124:
      return new InvalidPositionDelta(logs);
    case 6125:
      return new UserBankrupt(logs);
    case 6126:
      return new UserNotBankrupt(logs);
    case 6127:
      return new UserHasInvalidBorrow(logs);
    case 6128:
      return new DailyWithdrawLimit(logs);
    case 6129:
      return new DefaultError(logs);
    case 6130:
      return new InsufficientLPTokens(logs);
    case 6131:
      return new CantLPWithPerpPosition(logs);
    case 6132:
      return new UnableToBurnLPTokens(logs);
    case 6133:
      return new TryingToRemoveLiquidityTooFast(logs);
    case 6134:
      return new InvalidSpotMarketVault(logs);
    case 6135:
      return new InvalidSpotMarketState(logs);
    case 6136:
      return new InvalidSerumProgram(logs);
    case 6137:
      return new InvalidSerumMarket(logs);
    case 6138:
      return new InvalidSerumBids(logs);
    case 6139:
      return new InvalidSerumAsks(logs);
    case 6140:
      return new InvalidSerumOpenOrders(logs);
    case 6141:
      return new FailedSerumCPI(logs);
    case 6142:
      return new FailedToFillOnExternalMarket(logs);
    case 6143:
      return new InvalidFulfillmentConfig(logs);
    case 6144:
      return new InvalidFeeStructure(logs);
    case 6145:
      return new InsufficientIFShares(logs);
    case 6146:
      return new MarketActionPaused(logs);
    case 6147:
      return new MarketPlaceOrderPaused(logs);
    case 6148:
      return new MarketFillOrderPaused(logs);
    case 6149:
      return new MarketWithdrawPaused(logs);
    case 6150:
      return new ProtectedAssetTierViolation(logs);
    case 6151:
      return new IsolatedAssetTierViolation(logs);
    case 6152:
      return new UserCantBeDeleted(logs);
    case 6153:
      return new ReduceOnlyWithdrawIncreasedRisk(logs);
    case 6154:
      return new MaxOpenInterest(logs);
    case 6155:
      return new CantResolvePerpBankruptcy(logs);
    case 6156:
      return new LiquidationDoesntSatisfyLimitPrice(logs);
    case 6157:
      return new MarginTradingDisabled(logs);
    case 6158:
      return new InvalidMarketStatusToSettlePnl(logs);
    case 6159:
      return new PerpMarketNotInSettlement(logs);
    case 6160:
      return new PerpMarketNotInReduceOnly(logs);
    case 6161:
      return new PerpMarketSettlementBufferNotReached(logs);
    case 6162:
      return new PerpMarketSettlementUserHasOpenOrders(logs);
    case 6163:
      return new PerpMarketSettlementUserHasActiveLP(logs);
    case 6164:
      return new UnableToSettleExpiredUserPosition(logs);
    case 6165:
      return new UnequalMarketIndexForSpotTransfer(logs);
    case 6166:
      return new InvalidPerpPositionDetected(logs);
    case 6167:
      return new InvalidSpotPositionDetected(logs);
    case 6168:
      return new InvalidAmmDetected(logs);
    case 6169:
      return new InvalidAmmForFillDetected(logs);
    case 6170:
      return new InvalidAmmLimitPriceOverride(logs);
    case 6171:
      return new InvalidOrderFillPrice(logs);
    case 6172:
      return new SpotMarketBalanceInvariantViolated(logs);
    case 6173:
      return new SpotMarketVaultInvariantViolated(logs);
    case 6174:
      return new InvalidPDA(logs);
    case 6175:
      return new InvalidPDASigner(logs);
    case 6176:
      return new RevenueSettingsCannotSettleToIF(logs);
    case 6177:
      return new NoRevenueToSettleToIF(logs);
    case 6178:
      return new NoAmmPerpPnlDeficit(logs);
    case 6179:
      return new SufficientPerpPnlPool(logs);
    case 6180:
      return new InsufficientPerpPnlPool(logs);
    case 6181:
      return new PerpPnlDeficitBelowThreshold(logs);
    case 6182:
      return new MaxRevenueWithdrawPerPeriodReached(logs);
    case 6183:
      return new MaxIFWithdrawReached(logs);
    case 6184:
      return new NoIFWithdrawAvailable(logs);
    case 6185:
      return new InvalidIFUnstake(logs);
    case 6186:
      return new InvalidIFUnstakeSize(logs);
    case 6187:
      return new InvalidIFUnstakeCancel(logs);
    case 6188:
      return new InvalidIFForNewStakes(logs);
    case 6189:
      return new InvalidIFRebase(logs);
    case 6190:
      return new InvalidInsuranceUnstakeSize(logs);
    case 6191:
      return new InvalidOrderLimitPrice(logs);
    case 6192:
      return new InvalidIFDetected(logs);
    case 6193:
      return new InvalidAmmMaxSpreadDetected(logs);
    case 6194:
      return new InvalidConcentrationCoef(logs);
    case 6195:
      return new InvalidSrmVault(logs);
    case 6196:
      return new InvalidVaultOwner(logs);
    case 6197:
      return new InvalidMarketStatusForFills(logs);
    case 6198:
      return new IFWithdrawRequestInProgress(logs);
    case 6199:
      return new NoIFWithdrawRequestInProgress(logs);
    case 6200:
      return new IFWithdrawRequestTooSmall(logs);
    case 6201:
      return new IncorrectSpotMarketAccountPassed(logs);
    case 6202:
      return new BlockchainClockInconsistency(logs);
    case 6203:
      return new InvalidIFSharesDetected(logs);
    case 6204:
      return new NewLPSizeTooSmall(logs);
    case 6205:
      return new MarketStatusInvalidForNewLP(logs);
    case 6206:
      return new InvalidMarkTwapUpdateDetected(logs);
    case 6207:
      return new MarketSettlementAttemptOnActiveMarket(logs);
    case 6208:
      return new MarketSettlementRequiresSettledLP(logs);
    case 6209:
      return new MarketSettlementAttemptTooEarly(logs);
    case 6210:
      return new MarketSettlementTargetPriceInvalid(logs);
    case 6211:
      return new UnsupportedSpotMarket(logs);
    case 6212:
      return new SpotOrdersDisabled(logs);
    case 6213:
      return new MarketBeingInitialized(logs);
    case 6214:
      return new InvalidUserSubAccountId(logs);
    case 6215:
      return new InvalidTriggerOrderCondition(logs);
    case 6216:
      return new InvalidSpotPosition(logs);
    case 6217:
      return new CantTransferBetweenSameUserAccount(logs);
    case 6218:
      return new InvalidPerpPosition(logs);
    case 6219:
      return new UnableToGetLimitPrice(logs);
    case 6220:
      return new InvalidLiquidation(logs);
    case 6221:
      return new SpotFulfillmentConfigDisabled(logs);
    case 6222:
      return new InvalidMaker(logs);
    case 6223:
      return new FailedUnwrap(logs);
    case 6224:
      return new MaxNumberOfUsers(logs);
    case 6225:
      return new InvalidOracleForSettlePnl(logs);
    case 6226:
      return new MarginOrdersOpen(logs);
    case 6227:
      return new TierViolationLiquidatingPerpPnl(logs);
    case 6228:
      return new CouldNotLoadUserData(logs);
    case 6229:
      return new UserWrongMutability(logs);
    case 6230:
      return new InvalidUserAccount(logs);
    case 6231:
      return new CouldNotLoadUserStatsData(logs);
    case 6232:
      return new UserStatsWrongMutability(logs);
    case 6233:
      return new InvalidUserStatsAccount(logs);
    case 6234:
      return new UserNotFound(logs);
    case 6235:
      return new UnableToLoadUserAccount(logs);
    case 6236:
      return new UserStatsNotFound(logs);
    case 6237:
      return new UnableToLoadUserStatsAccount(logs);
    case 6238:
      return new UserNotInactive(logs);
    case 6239:
      return new RevertFill(logs);
    case 6240:
      return new InvalidMarketAccountforDeletion(logs);
    case 6241:
      return new InvalidSpotFulfillmentParams(logs);
    case 6242:
      return new FailedToGetMint(logs);
    case 6243:
      return new FailedPhoenixCPI(logs);
    case 6244:
      return new FailedToDeserializePhoenixMarket(logs);
    case 6245:
      return new InvalidPricePrecision(logs);
    case 6246:
      return new InvalidPhoenixProgram(logs);
    case 6247:
      return new InvalidPhoenixMarket(logs);
    case 6248:
      return new InvalidSwap(logs);
    case 6249:
      return new SwapLimitPriceBreached(logs);
    case 6250:
      return new SpotMarketReduceOnly(logs);
    case 6251:
      return new FundingWasNotUpdated(logs);
    case 6252:
      return new ImpossibleFill(logs);
    case 6253:
      return new CantUpdatePerpBidAskTwap(logs);
    case 6254:
      return new UserReduceOnly(logs);
    case 6255:
      return new InvalidMarginCalculation(logs);
    case 6256:
      return new CantPayUserInitFee(logs);
    case 6257:
      return new CantReclaimRent(logs);
    case 6258:
      return new InsuranceFundOperationPaused(logs);
    case 6259:
      return new NoUnsettledPnl(logs);
    case 6260:
      return new PnlPoolCantSettleUser(logs);
    case 6261:
      return new OracleNonPositive(logs);
    case 6262:
      return new OracleTooVolatile(logs);
    case 6263:
      return new OracleTooUncertain(logs);
    case 6264:
      return new OracleStaleForMargin(logs);
    case 6265:
      return new OracleInsufficientDataPoints(logs);
    case 6266:
      return new OracleStaleForAMM(logs);
    case 6267:
      return new UnableToParsePullOracleMessage(logs);
    case 6268:
      return new MaxBorrows(logs);
    case 6269:
      return new OracleUpdatesNotMonotonic(logs);
    case 6270:
      return new OraclePriceFeedMessageMismatch(logs);
    case 6271:
      return new OracleUnsupportedMessageType(logs);
    case 6272:
      return new OracleDeserializeMessageFailed(logs);
    case 6273:
      return new OracleWrongGuardianSetOwner(logs);
    case 6274:
      return new OracleWrongWriteAuthority(logs);
    case 6275:
      return new OracleWrongVaaOwner(logs);
    case 6276:
      return new OracleTooManyPriceAccountUpdates(logs);
    case 6277:
      return new OracleMismatchedVaaAndPriceUpdates(logs);
    case 6278:
      return new OracleBadRemainingAccountPublicKey(logs);
    case 6279:
      return new FailedOpenbookV2CPI(logs);
    case 6280:
      return new InvalidOpenbookV2Program(logs);
    case 6281:
      return new InvalidOpenbookV2Market(logs);
    case 6282:
      return new NonZeroTransferFee(logs);
    case 6283:
      return new LiquidationOrderFailedToFill(logs);
    case 6284:
      return new InvalidPredictionMarketOrder(logs);
    case 6285:
      return new InvalidVerificationIxIndex(logs);
    case 6286:
      return new SigVerificationFailed(logs);
    case 6287:
      return new MismatchedSwiftOrderParamsMarketIndex(logs);
    case 6288:
      return new InvalidSwiftOrderParam(logs);
    case 6289:
      return new PlaceAndTakeOrderSuccessConditionFailed(logs);
    case 6290:
      return new InvalidHighLeverageModeConfig(logs);
  }

  return null;
}
