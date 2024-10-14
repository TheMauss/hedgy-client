import * as SwapDirection from "./SwapDirection";
import * as ModifyOrderId from "./ModifyOrderId";
import * as PositionDirection from "./PositionDirection";
import * as SpotFulfillmentType from "./SpotFulfillmentType";
import * as SwapReduceOnly from "./SwapReduceOnly";
import * as TwapPeriod from "./TwapPeriod";
import * as LiquidationMultiplierType from "./LiquidationMultiplierType";
import * as MarginRequirementType from "./MarginRequirementType";
import * as OracleValidity from "./OracleValidity";
import * as DriftAction from "./DriftAction";
import * as PositionUpdateType from "./PositionUpdateType";
import * as DepositExplanation from "./DepositExplanation";
import * as DepositDirection from "./DepositDirection";
import * as OrderAction from "./OrderAction";
import * as OrderActionExplanation from "./OrderActionExplanation";
import * as LPAction from "./LPAction";
import * as LiquidationType from "./LiquidationType";
import * as SettlePnlExplanation from "./SettlePnlExplanation";
import * as StakeAction from "./StakeAction";
import * as FillMode from "./FillMode";
import * as PerpFulfillmentMethod from "./PerpFulfillmentMethod";
import * as SpotFulfillmentMethod from "./SpotFulfillmentMethod";
import * as MarginCalculationMode from "./MarginCalculationMode";
import * as OracleSource from "./OracleSource";
import * as PostOnlyParam from "./PostOnlyParam";
import * as ModifyOrderPolicy from "./ModifyOrderPolicy";
import * as PlaceAndTakeOrderSuccessCondition from "./PlaceAndTakeOrderSuccessCondition";
import * as PerpOperation from "./PerpOperation";
import * as SpotOperation from "./SpotOperation";
import * as InsuranceFundOperation from "./InsuranceFundOperation";
import * as MarketStatus from "./MarketStatus";
import * as ContractType from "./ContractType";
import * as ContractTier from "./ContractTier";
import * as AMMLiquiditySplit from "./AMMLiquiditySplit";
import * as SettlePnlMode from "./SettlePnlMode";
import * as SpotBalanceType from "./SpotBalanceType";
import * as SpotFulfillmentConfigStatus from "./SpotFulfillmentConfigStatus";
import * as AssetTier from "./AssetTier";
import * as ExchangeStatus from "./ExchangeStatus";
import * as UserStatus from "./UserStatus";
import * as AssetType from "./AssetType";
import * as OrderStatus from "./OrderStatus";
import * as OrderType from "./OrderType";
import * as OrderTriggerCondition from "./OrderTriggerCondition";
import * as MarketType from "./MarketType";
import * as MarginMode from "./MarginMode";

export { UpdatePerpMarketSummaryStatsParams } from "./UpdatePerpMarketSummaryStatsParams";
export type {
  UpdatePerpMarketSummaryStatsParamsFields,
  UpdatePerpMarketSummaryStatsParamsJSON,
} from "./UpdatePerpMarketSummaryStatsParams";
export { LiquidatePerpRecord } from "./LiquidatePerpRecord";
export type {
  LiquidatePerpRecordFields,
  LiquidatePerpRecordJSON,
} from "./LiquidatePerpRecord";
export { LiquidateSpotRecord } from "./LiquidateSpotRecord";
export type {
  LiquidateSpotRecordFields,
  LiquidateSpotRecordJSON,
} from "./LiquidateSpotRecord";
export { LiquidateBorrowForPerpPnlRecord } from "./LiquidateBorrowForPerpPnlRecord";
export type {
  LiquidateBorrowForPerpPnlRecordFields,
  LiquidateBorrowForPerpPnlRecordJSON,
} from "./LiquidateBorrowForPerpPnlRecord";
export { LiquidatePerpPnlForDepositRecord } from "./LiquidatePerpPnlForDepositRecord";
export type {
  LiquidatePerpPnlForDepositRecordFields,
  LiquidatePerpPnlForDepositRecordJSON,
} from "./LiquidatePerpPnlForDepositRecord";
export { PerpBankruptcyRecord } from "./PerpBankruptcyRecord";
export type {
  PerpBankruptcyRecordFields,
  PerpBankruptcyRecordJSON,
} from "./PerpBankruptcyRecord";
export { SpotBankruptcyRecord } from "./SpotBankruptcyRecord";
export type {
  SpotBankruptcyRecordFields,
  SpotBankruptcyRecordJSON,
} from "./SpotBankruptcyRecord";
export { MarketIdentifier } from "./MarketIdentifier";
export type {
  MarketIdentifierFields,
  MarketIdentifierJSON,
} from "./MarketIdentifier";
export { HistoricalOracleData } from "./HistoricalOracleData";
export type {
  HistoricalOracleDataFields,
  HistoricalOracleDataJSON,
} from "./HistoricalOracleData";
export { HistoricalIndexData } from "./HistoricalIndexData";
export type {
  HistoricalIndexDataFields,
  HistoricalIndexDataJSON,
} from "./HistoricalIndexData";
export { PrelaunchOracleParams } from "./PrelaunchOracleParams";
export type {
  PrelaunchOracleParamsFields,
  PrelaunchOracleParamsJSON,
} from "./PrelaunchOracleParams";
export { OrderParams } from "./OrderParams";
export type { OrderParamsFields, OrderParamsJSON } from "./OrderParams";
export { SwiftServerMessage } from "./SwiftServerMessage";
export type {
  SwiftServerMessageFields,
  SwiftServerMessageJSON,
} from "./SwiftServerMessage";
export { SwiftOrderParamsMessage } from "./SwiftOrderParamsMessage";
export type {
  SwiftOrderParamsMessageFields,
  SwiftOrderParamsMessageJSON,
} from "./SwiftOrderParamsMessage";
export { SwiftTriggerOrderParams } from "./SwiftTriggerOrderParams";
export type {
  SwiftTriggerOrderParamsFields,
  SwiftTriggerOrderParamsJSON,
} from "./SwiftTriggerOrderParams";
export { ModifyOrderParams } from "./ModifyOrderParams";
export type {
  ModifyOrderParamsFields,
  ModifyOrderParamsJSON,
} from "./ModifyOrderParams";
export { InsuranceClaim } from "./InsuranceClaim";
export type {
  InsuranceClaimFields,
  InsuranceClaimJSON,
} from "./InsuranceClaim";
export { PoolBalance } from "./PoolBalance";
export type { PoolBalanceFields, PoolBalanceJSON } from "./PoolBalance";
export { AMM } from "./AMM";
export type { AMMFields, AMMJSON } from "./AMM";
export { InsuranceFund } from "./InsuranceFund";
export type { InsuranceFundFields, InsuranceFundJSON } from "./InsuranceFund";
export { OracleGuardRails } from "./OracleGuardRails";
export type {
  OracleGuardRailsFields,
  OracleGuardRailsJSON,
} from "./OracleGuardRails";
export { PriceDivergenceGuardRails } from "./PriceDivergenceGuardRails";
export type {
  PriceDivergenceGuardRailsFields,
  PriceDivergenceGuardRailsJSON,
} from "./PriceDivergenceGuardRails";
export { ValidityGuardRails } from "./ValidityGuardRails";
export type {
  ValidityGuardRailsFields,
  ValidityGuardRailsJSON,
} from "./ValidityGuardRails";
export { FeeStructure } from "./FeeStructure";
export type { FeeStructureFields, FeeStructureJSON } from "./FeeStructure";
export { FeeTier } from "./FeeTier";
export type { FeeTierFields, FeeTierJSON } from "./FeeTier";
export { OrderFillerRewardStructure } from "./OrderFillerRewardStructure";
export type {
  OrderFillerRewardStructureFields,
  OrderFillerRewardStructureJSON,
} from "./OrderFillerRewardStructure";
export { UserFees } from "./UserFees";
export type { UserFeesFields, UserFeesJSON } from "./UserFees";
export { SpotPosition } from "./SpotPosition";
export type { SpotPositionFields, SpotPositionJSON } from "./SpotPosition";
export { PerpPosition } from "./PerpPosition";
export type { PerpPositionFields, PerpPositionJSON } from "./PerpPosition";
export { Order } from "./Order";
export type { OrderFields, OrderJSON } from "./Order";
export { SwapDirection };

export type SwapDirectionKind = SwapDirection.Add | SwapDirection.Remove;
export type SwapDirectionJSON =
  | SwapDirection.AddJSON
  | SwapDirection.RemoveJSON;

export { ModifyOrderId };

export type ModifyOrderIdKind =
  | ModifyOrderId.UserOrderId
  | ModifyOrderId.OrderId;
export type ModifyOrderIdJSON =
  | ModifyOrderId.UserOrderIdJSON
  | ModifyOrderId.OrderIdJSON;

export { PositionDirection };

export type PositionDirectionKind =
  | PositionDirection.Long
  | PositionDirection.Short;
export type PositionDirectionJSON =
  | PositionDirection.LongJSON
  | PositionDirection.ShortJSON;

export { SpotFulfillmentType };

export type SpotFulfillmentTypeKind =
  | SpotFulfillmentType.SerumV3
  | SpotFulfillmentType.Match
  | SpotFulfillmentType.PhoenixV1
  | SpotFulfillmentType.OpenbookV2;
export type SpotFulfillmentTypeJSON =
  | SpotFulfillmentType.SerumV3JSON
  | SpotFulfillmentType.MatchJSON
  | SpotFulfillmentType.PhoenixV1JSON
  | SpotFulfillmentType.OpenbookV2JSON;

export { SwapReduceOnly };

export type SwapReduceOnlyKind = SwapReduceOnly.In | SwapReduceOnly.Out;
export type SwapReduceOnlyJSON = SwapReduceOnly.InJSON | SwapReduceOnly.OutJSON;

export { TwapPeriod };

export type TwapPeriodKind = TwapPeriod.FundingPeriod | TwapPeriod.FiveMin;
export type TwapPeriodJSON =
  | TwapPeriod.FundingPeriodJSON
  | TwapPeriod.FiveMinJSON;

export { LiquidationMultiplierType };

export type LiquidationMultiplierTypeKind =
  | LiquidationMultiplierType.Discount
  | LiquidationMultiplierType.Premium;
export type LiquidationMultiplierTypeJSON =
  | LiquidationMultiplierType.DiscountJSON
  | LiquidationMultiplierType.PremiumJSON;

export { MarginRequirementType };

export type MarginRequirementTypeKind =
  | MarginRequirementType.Initial
  | MarginRequirementType.Fill
  | MarginRequirementType.Maintenance;
export type MarginRequirementTypeJSON =
  | MarginRequirementType.InitialJSON
  | MarginRequirementType.FillJSON
  | MarginRequirementType.MaintenanceJSON;

export { OracleValidity };

export type OracleValidityKind =
  | OracleValidity.NonPositive
  | OracleValidity.TooVolatile
  | OracleValidity.TooUncertain
  | OracleValidity.StaleForMargin
  | OracleValidity.InsufficientDataPoints
  | OracleValidity.StaleForAMM
  | OracleValidity.Valid;
export type OracleValidityJSON =
  | OracleValidity.NonPositiveJSON
  | OracleValidity.TooVolatileJSON
  | OracleValidity.TooUncertainJSON
  | OracleValidity.StaleForMarginJSON
  | OracleValidity.InsufficientDataPointsJSON
  | OracleValidity.StaleForAMMJSON
  | OracleValidity.ValidJSON;

export { DriftAction };

export type DriftActionKind =
  | DriftAction.UpdateFunding
  | DriftAction.SettlePnl
  | DriftAction.TriggerOrder
  | DriftAction.FillOrderMatch
  | DriftAction.FillOrderAmm
  | DriftAction.Liquidate
  | DriftAction.MarginCalc
  | DriftAction.UpdateTwap
  | DriftAction.UpdateAMMCurve
  | DriftAction.OracleOrderPrice;
export type DriftActionJSON =
  | DriftAction.UpdateFundingJSON
  | DriftAction.SettlePnlJSON
  | DriftAction.TriggerOrderJSON
  | DriftAction.FillOrderMatchJSON
  | DriftAction.FillOrderAmmJSON
  | DriftAction.LiquidateJSON
  | DriftAction.MarginCalcJSON
  | DriftAction.UpdateTwapJSON
  | DriftAction.UpdateAMMCurveJSON
  | DriftAction.OracleOrderPriceJSON;

export { PositionUpdateType };

export type PositionUpdateTypeKind =
  | PositionUpdateType.Open
  | PositionUpdateType.Increase
  | PositionUpdateType.Reduce
  | PositionUpdateType.Close
  | PositionUpdateType.Flip;
export type PositionUpdateTypeJSON =
  | PositionUpdateType.OpenJSON
  | PositionUpdateType.IncreaseJSON
  | PositionUpdateType.ReduceJSON
  | PositionUpdateType.CloseJSON
  | PositionUpdateType.FlipJSON;

export { DepositExplanation };

export type DepositExplanationKind =
  | DepositExplanation.None
  | DepositExplanation.Transfer
  | DepositExplanation.Borrow
  | DepositExplanation.RepayBorrow;
export type DepositExplanationJSON =
  | DepositExplanation.NoneJSON
  | DepositExplanation.TransferJSON
  | DepositExplanation.BorrowJSON
  | DepositExplanation.RepayBorrowJSON;

export { DepositDirection };

export type DepositDirectionKind =
  | DepositDirection.Deposit
  | DepositDirection.Withdraw;
export type DepositDirectionJSON =
  | DepositDirection.DepositJSON
  | DepositDirection.WithdrawJSON;

export { OrderAction };

export type OrderActionKind =
  | OrderAction.Place
  | OrderAction.Cancel
  | OrderAction.Fill
  | OrderAction.Trigger
  | OrderAction.Expire;
export type OrderActionJSON =
  | OrderAction.PlaceJSON
  | OrderAction.CancelJSON
  | OrderAction.FillJSON
  | OrderAction.TriggerJSON
  | OrderAction.ExpireJSON;

export { OrderActionExplanation };

export type OrderActionExplanationKind =
  | OrderActionExplanation.None
  | OrderActionExplanation.InsufficientFreeCollateral
  | OrderActionExplanation.OraclePriceBreachedLimitPrice
  | OrderActionExplanation.MarketOrderFilledToLimitPrice
  | OrderActionExplanation.OrderExpired
  | OrderActionExplanation.Liquidation
  | OrderActionExplanation.OrderFilledWithAMM
  | OrderActionExplanation.OrderFilledWithAMMJit
  | OrderActionExplanation.OrderFilledWithMatch
  | OrderActionExplanation.OrderFilledWithMatchJit
  | OrderActionExplanation.MarketExpired
  | OrderActionExplanation.RiskingIncreasingOrder
  | OrderActionExplanation.ReduceOnlyOrderIncreasedPosition
  | OrderActionExplanation.OrderFillWithSerum
  | OrderActionExplanation.NoBorrowLiquidity
  | OrderActionExplanation.OrderFillWithPhoenix
  | OrderActionExplanation.OrderFilledWithAMMJitLPSplit
  | OrderActionExplanation.OrderFilledWithLPJit
  | OrderActionExplanation.DeriskLp
  | OrderActionExplanation.OrderFilledWithOpenbookV2;
export type OrderActionExplanationJSON =
  | OrderActionExplanation.NoneJSON
  | OrderActionExplanation.InsufficientFreeCollateralJSON
  | OrderActionExplanation.OraclePriceBreachedLimitPriceJSON
  | OrderActionExplanation.MarketOrderFilledToLimitPriceJSON
  | OrderActionExplanation.OrderExpiredJSON
  | OrderActionExplanation.LiquidationJSON
  | OrderActionExplanation.OrderFilledWithAMMJSON
  | OrderActionExplanation.OrderFilledWithAMMJitJSON
  | OrderActionExplanation.OrderFilledWithMatchJSON
  | OrderActionExplanation.OrderFilledWithMatchJitJSON
  | OrderActionExplanation.MarketExpiredJSON
  | OrderActionExplanation.RiskingIncreasingOrderJSON
  | OrderActionExplanation.ReduceOnlyOrderIncreasedPositionJSON
  | OrderActionExplanation.OrderFillWithSerumJSON
  | OrderActionExplanation.NoBorrowLiquidityJSON
  | OrderActionExplanation.OrderFillWithPhoenixJSON
  | OrderActionExplanation.OrderFilledWithAMMJitLPSplitJSON
  | OrderActionExplanation.OrderFilledWithLPJitJSON
  | OrderActionExplanation.DeriskLpJSON
  | OrderActionExplanation.OrderFilledWithOpenbookV2JSON;

export { LPAction };

export type LPActionKind =
  | LPAction.AddLiquidity
  | LPAction.RemoveLiquidity
  | LPAction.SettleLiquidity
  | LPAction.RemoveLiquidityDerisk;
export type LPActionJSON =
  | LPAction.AddLiquidityJSON
  | LPAction.RemoveLiquidityJSON
  | LPAction.SettleLiquidityJSON
  | LPAction.RemoveLiquidityDeriskJSON;

export { LiquidationType };

export type LiquidationTypeKind =
  | LiquidationType.LiquidatePerp
  | LiquidationType.LiquidateSpot
  | LiquidationType.LiquidateBorrowForPerpPnl
  | LiquidationType.LiquidatePerpPnlForDeposit
  | LiquidationType.PerpBankruptcy
  | LiquidationType.SpotBankruptcy;
export type LiquidationTypeJSON =
  | LiquidationType.LiquidatePerpJSON
  | LiquidationType.LiquidateSpotJSON
  | LiquidationType.LiquidateBorrowForPerpPnlJSON
  | LiquidationType.LiquidatePerpPnlForDepositJSON
  | LiquidationType.PerpBankruptcyJSON
  | LiquidationType.SpotBankruptcyJSON;

export { SettlePnlExplanation };

export type SettlePnlExplanationKind =
  | SettlePnlExplanation.None
  | SettlePnlExplanation.ExpiredPosition;
export type SettlePnlExplanationJSON =
  | SettlePnlExplanation.NoneJSON
  | SettlePnlExplanation.ExpiredPositionJSON;

export { StakeAction };

export type StakeActionKind =
  | StakeAction.Stake
  | StakeAction.UnstakeRequest
  | StakeAction.UnstakeCancelRequest
  | StakeAction.Unstake
  | StakeAction.UnstakeTransfer
  | StakeAction.StakeTransfer;
export type StakeActionJSON =
  | StakeAction.StakeJSON
  | StakeAction.UnstakeRequestJSON
  | StakeAction.UnstakeCancelRequestJSON
  | StakeAction.UnstakeJSON
  | StakeAction.UnstakeTransferJSON
  | StakeAction.StakeTransferJSON;

export { FillMode };

export type FillModeKind =
  | FillMode.Fill
  | FillMode.PlaceAndMake
  | FillMode.PlaceAndTake
  | FillMode.Liquidation;
export type FillModeJSON =
  | FillMode.FillJSON
  | FillMode.PlaceAndMakeJSON
  | FillMode.PlaceAndTakeJSON
  | FillMode.LiquidationJSON;

export { PerpFulfillmentMethod };

export type PerpFulfillmentMethodKind =
  | PerpFulfillmentMethod.AMM
  | PerpFulfillmentMethod.Match;
export type PerpFulfillmentMethodJSON =
  | PerpFulfillmentMethod.AMMJSON
  | PerpFulfillmentMethod.MatchJSON;

export { SpotFulfillmentMethod };

export type SpotFulfillmentMethodKind =
  | SpotFulfillmentMethod.ExternalMarket
  | SpotFulfillmentMethod.Match;
export type SpotFulfillmentMethodJSON =
  | SpotFulfillmentMethod.ExternalMarketJSON
  | SpotFulfillmentMethod.MatchJSON;

export { MarginCalculationMode };

export type MarginCalculationModeKind =
  | MarginCalculationMode.Standard
  | MarginCalculationMode.Liquidation;
export type MarginCalculationModeJSON =
  | MarginCalculationMode.StandardJSON
  | MarginCalculationMode.LiquidationJSON;

export { OracleSource };

export type OracleSourceKind =
  | OracleSource.Pyth
  | OracleSource.Switchboard
  | OracleSource.QuoteAsset
  | OracleSource.Pyth1K
  | OracleSource.Pyth1M
  | OracleSource.PythStableCoin
  | OracleSource.Prelaunch
  | OracleSource.PythPull
  | OracleSource.Pyth1KPull
  | OracleSource.Pyth1MPull
  | OracleSource.PythStableCoinPull
  | OracleSource.SwitchboardOnDemand;
export type OracleSourceJSON =
  | OracleSource.PythJSON
  | OracleSource.SwitchboardJSON
  | OracleSource.QuoteAssetJSON
  | OracleSource.Pyth1KJSON
  | OracleSource.Pyth1MJSON
  | OracleSource.PythStableCoinJSON
  | OracleSource.PrelaunchJSON
  | OracleSource.PythPullJSON
  | OracleSource.Pyth1KPullJSON
  | OracleSource.Pyth1MPullJSON
  | OracleSource.PythStableCoinPullJSON
  | OracleSource.SwitchboardOnDemandJSON;

export { PostOnlyParam };

export type PostOnlyParamKind =
  | PostOnlyParam.None
  | PostOnlyParam.MustPostOnly
  | PostOnlyParam.TryPostOnly
  | PostOnlyParam.Slide;
export type PostOnlyParamJSON =
  | PostOnlyParam.NoneJSON
  | PostOnlyParam.MustPostOnlyJSON
  | PostOnlyParam.TryPostOnlyJSON
  | PostOnlyParam.SlideJSON;

export { ModifyOrderPolicy };

export type ModifyOrderPolicyKind =
  | ModifyOrderPolicy.TryModify
  | ModifyOrderPolicy.MustModify;
export type ModifyOrderPolicyJSON =
  | ModifyOrderPolicy.TryModifyJSON
  | ModifyOrderPolicy.MustModifyJSON;

export { PlaceAndTakeOrderSuccessCondition };

export type PlaceAndTakeOrderSuccessConditionKind =
  | PlaceAndTakeOrderSuccessCondition.PartialFill
  | PlaceAndTakeOrderSuccessCondition.FullFill;
export type PlaceAndTakeOrderSuccessConditionJSON =
  | PlaceAndTakeOrderSuccessCondition.PartialFillJSON
  | PlaceAndTakeOrderSuccessCondition.FullFillJSON;

export { PerpOperation };

export type PerpOperationKind =
  | PerpOperation.UpdateFunding
  | PerpOperation.AmmFill
  | PerpOperation.Fill
  | PerpOperation.SettlePnl
  | PerpOperation.SettlePnlWithPosition
  | PerpOperation.Liquidation;
export type PerpOperationJSON =
  | PerpOperation.UpdateFundingJSON
  | PerpOperation.AmmFillJSON
  | PerpOperation.FillJSON
  | PerpOperation.SettlePnlJSON
  | PerpOperation.SettlePnlWithPositionJSON
  | PerpOperation.LiquidationJSON;

export { SpotOperation };

export type SpotOperationKind =
  | SpotOperation.UpdateCumulativeInterest
  | SpotOperation.Fill
  | SpotOperation.Deposit
  | SpotOperation.Withdraw
  | SpotOperation.Liquidation;
export type SpotOperationJSON =
  | SpotOperation.UpdateCumulativeInterestJSON
  | SpotOperation.FillJSON
  | SpotOperation.DepositJSON
  | SpotOperation.WithdrawJSON
  | SpotOperation.LiquidationJSON;

export { InsuranceFundOperation };

export type InsuranceFundOperationKind =
  | InsuranceFundOperation.Init
  | InsuranceFundOperation.Add
  | InsuranceFundOperation.RequestRemove
  | InsuranceFundOperation.Remove;
export type InsuranceFundOperationJSON =
  | InsuranceFundOperation.InitJSON
  | InsuranceFundOperation.AddJSON
  | InsuranceFundOperation.RequestRemoveJSON
  | InsuranceFundOperation.RemoveJSON;

export { MarketStatus };

export type MarketStatusKind =
  | MarketStatus.Initialized
  | MarketStatus.Active
  | MarketStatus.FundingPaused
  | MarketStatus.AmmPaused
  | MarketStatus.FillPaused
  | MarketStatus.WithdrawPaused
  | MarketStatus.ReduceOnly
  | MarketStatus.Settlement
  | MarketStatus.Delisted;
export type MarketStatusJSON =
  | MarketStatus.InitializedJSON
  | MarketStatus.ActiveJSON
  | MarketStatus.FundingPausedJSON
  | MarketStatus.AmmPausedJSON
  | MarketStatus.FillPausedJSON
  | MarketStatus.WithdrawPausedJSON
  | MarketStatus.ReduceOnlyJSON
  | MarketStatus.SettlementJSON
  | MarketStatus.DelistedJSON;

export { ContractType };

export type ContractTypeKind =
  | ContractType.Perpetual
  | ContractType.Future
  | ContractType.Prediction;
export type ContractTypeJSON =
  | ContractType.PerpetualJSON
  | ContractType.FutureJSON
  | ContractType.PredictionJSON;

export { ContractTier };

export type ContractTierKind =
  | ContractTier.A
  | ContractTier.B
  | ContractTier.C
  | ContractTier.Speculative
  | ContractTier.HighlySpeculative
  | ContractTier.Isolated;
export type ContractTierJSON =
  | ContractTier.AJSON
  | ContractTier.BJSON
  | ContractTier.CJSON
  | ContractTier.SpeculativeJSON
  | ContractTier.HighlySpeculativeJSON
  | ContractTier.IsolatedJSON;

export { AMMLiquiditySplit };

export type AMMLiquiditySplitKind =
  | AMMLiquiditySplit.ProtocolOwned
  | AMMLiquiditySplit.LPOwned
  | AMMLiquiditySplit.Shared;
export type AMMLiquiditySplitJSON =
  | AMMLiquiditySplit.ProtocolOwnedJSON
  | AMMLiquiditySplit.LPOwnedJSON
  | AMMLiquiditySplit.SharedJSON;

export { SettlePnlMode };

export type SettlePnlModeKind =
  | SettlePnlMode.MustSettle
  | SettlePnlMode.TrySettle;
export type SettlePnlModeJSON =
  | SettlePnlMode.MustSettleJSON
  | SettlePnlMode.TrySettleJSON;

export { SpotBalanceType };

export type SpotBalanceTypeKind =
  | SpotBalanceType.Deposit
  | SpotBalanceType.Borrow;
export type SpotBalanceTypeJSON =
  | SpotBalanceType.DepositJSON
  | SpotBalanceType.BorrowJSON;

export { SpotFulfillmentConfigStatus };

export type SpotFulfillmentConfigStatusKind =
  | SpotFulfillmentConfigStatus.Enabled
  | SpotFulfillmentConfigStatus.Disabled;
export type SpotFulfillmentConfigStatusJSON =
  | SpotFulfillmentConfigStatus.EnabledJSON
  | SpotFulfillmentConfigStatus.DisabledJSON;

export { AssetTier };

export type AssetTierKind =
  | AssetTier.Collateral
  | AssetTier.Protected
  | AssetTier.Cross
  | AssetTier.Isolated
  | AssetTier.Unlisted;
export type AssetTierJSON =
  | AssetTier.CollateralJSON
  | AssetTier.ProtectedJSON
  | AssetTier.CrossJSON
  | AssetTier.IsolatedJSON
  | AssetTier.UnlistedJSON;

export { ExchangeStatus };

export type ExchangeStatusKind =
  | ExchangeStatus.DepositPaused
  | ExchangeStatus.WithdrawPaused
  | ExchangeStatus.AmmPaused
  | ExchangeStatus.FillPaused
  | ExchangeStatus.LiqPaused
  | ExchangeStatus.FundingPaused
  | ExchangeStatus.SettlePnlPaused;
export type ExchangeStatusJSON =
  | ExchangeStatus.DepositPausedJSON
  | ExchangeStatus.WithdrawPausedJSON
  | ExchangeStatus.AmmPausedJSON
  | ExchangeStatus.FillPausedJSON
  | ExchangeStatus.LiqPausedJSON
  | ExchangeStatus.FundingPausedJSON
  | ExchangeStatus.SettlePnlPausedJSON;

export { UserStatus };

export type UserStatusKind =
  | UserStatus.BeingLiquidated
  | UserStatus.Bankrupt
  | UserStatus.ReduceOnly
  | UserStatus.AdvancedLp;
export type UserStatusJSON =
  | UserStatus.BeingLiquidatedJSON
  | UserStatus.BankruptJSON
  | UserStatus.ReduceOnlyJSON
  | UserStatus.AdvancedLpJSON;

export { AssetType };

export type AssetTypeKind = AssetType.Base | AssetType.Quote;
export type AssetTypeJSON = AssetType.BaseJSON | AssetType.QuoteJSON;

export { OrderStatus };

export type OrderStatusKind =
  | OrderStatus.Init
  | OrderStatus.Open
  | OrderStatus.Filled
  | OrderStatus.Canceled;
export type OrderStatusJSON =
  | OrderStatus.InitJSON
  | OrderStatus.OpenJSON
  | OrderStatus.FilledJSON
  | OrderStatus.CanceledJSON;

export { OrderType };

export type OrderTypeKind =
  | OrderType.Market
  | OrderType.Limit
  | OrderType.TriggerMarket
  | OrderType.TriggerLimit
  | OrderType.Oracle;
export type OrderTypeJSON =
  | OrderType.MarketJSON
  | OrderType.LimitJSON
  | OrderType.TriggerMarketJSON
  | OrderType.TriggerLimitJSON
  | OrderType.OracleJSON;

export { OrderTriggerCondition };

export type OrderTriggerConditionKind =
  | OrderTriggerCondition.Above
  | OrderTriggerCondition.Below
  | OrderTriggerCondition.TriggeredAbove
  | OrderTriggerCondition.TriggeredBelow;
export type OrderTriggerConditionJSON =
  | OrderTriggerCondition.AboveJSON
  | OrderTriggerCondition.BelowJSON
  | OrderTriggerCondition.TriggeredAboveJSON
  | OrderTriggerCondition.TriggeredBelowJSON;

export { MarketType };

export type MarketTypeKind = MarketType.Spot | MarketType.Perp;
export type MarketTypeJSON = MarketType.SpotJSON | MarketType.PerpJSON;

export { MarginMode };

export type MarginModeKind = MarginMode.Default | MarginMode.HighLeverage;
export type MarginModeJSON =
  | MarginMode.DefaultJSON
  | MarginMode.HighLeverageJSON;
