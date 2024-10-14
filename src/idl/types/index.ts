import * as VaultDepositorAction from "./VaultDepositorAction";
import * as WithdrawUnit from "./WithdrawUnit";

export { VaultWithProtocolParams } from "./VaultWithProtocolParams";
export type {
  VaultWithProtocolParamsFields,
  VaultWithProtocolParamsJSON,
} from "./VaultWithProtocolParams";
export { VaultProtocolParams } from "./VaultProtocolParams";
export type {
  VaultProtocolParamsFields,
  VaultProtocolParamsJSON,
} from "./VaultProtocolParams";
export { VaultParams } from "./VaultParams";
export type { VaultParamsFields, VaultParamsJSON } from "./VaultParams";
export { UpdateVaultProtocolParams } from "./UpdateVaultProtocolParams";
export type {
  UpdateVaultProtocolParamsFields,
  UpdateVaultProtocolParamsJSON,
} from "./UpdateVaultProtocolParams";
export { UpdateVaultParams } from "./UpdateVaultParams";
export type {
  UpdateVaultParamsFields,
  UpdateVaultParamsJSON,
} from "./UpdateVaultParams";
export { WithdrawRequest } from "./WithdrawRequest";
export type {
  WithdrawRequestFields,
  WithdrawRequestJSON,
} from "./WithdrawRequest";
export { VaultDepositorAction };

export type VaultDepositorActionKind =
  | VaultDepositorAction.Deposit
  | VaultDepositorAction.WithdrawRequest
  | VaultDepositorAction.CancelWithdrawRequest
  | VaultDepositorAction.Withdraw
  | VaultDepositorAction.FeePayment;
export type VaultDepositorActionJSON =
  | VaultDepositorAction.DepositJSON
  | VaultDepositorAction.WithdrawRequestJSON
  | VaultDepositorAction.CancelWithdrawRequestJSON
  | VaultDepositorAction.WithdrawJSON
  | VaultDepositorAction.FeePaymentJSON;

export { WithdrawUnit };

export type WithdrawUnitKind =
  | WithdrawUnit.Shares
  | WithdrawUnit.Token
  | WithdrawUnit.SharesPercent;
export type WithdrawUnitJSON =
  | WithdrawUnit.SharesJSON
  | WithdrawUnit.TokenJSON
  | WithdrawUnit.SharesPercentJSON;
