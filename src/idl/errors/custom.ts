export type CustomError =
  | Default
  | InvalidVaultRebase
  | InvalidVaultSharesDetected
  | CannotWithdrawBeforeRedeemPeriodEnd
  | InvalidVaultWithdraw
  | InsufficientVaultShares
  | InvalidVaultWithdrawSize
  | InvalidVaultForNewDepositors
  | VaultWithdrawRequestInProgress
  | VaultIsAtCapacity
  | InvalidVaultDepositorInitialization
  | DelegateNotAvailableForLiquidation
  | InvalidEquityValue
  | VaultInLiquidation
  | DriftError
  | InvalidVaultInitialization
  | InvalidVaultUpdate
  | PermissionedVault
  | WithdrawInProgress
  | SharesPercentTooLarge
  | InvalidVaultDeposit
  | OngoingLiquidation
  | VaultProtocolMissing;

export class Default extends Error {
  static readonly code = 6000;
  readonly code = 6000;
  readonly name = "Default";
  readonly msg = "Default";

  constructor(readonly logs?: string[]) {
    super("6000: Default");
  }
}

export class InvalidVaultRebase extends Error {
  static readonly code = 6001;
  readonly code = 6001;
  readonly name = "InvalidVaultRebase";
  readonly msg = "InvalidVaultRebase";

  constructor(readonly logs?: string[]) {
    super("6001: InvalidVaultRebase");
  }
}

export class InvalidVaultSharesDetected extends Error {
  static readonly code = 6002;
  readonly code = 6002;
  readonly name = "InvalidVaultSharesDetected";
  readonly msg = "InvalidVaultSharesDetected";

  constructor(readonly logs?: string[]) {
    super("6002: InvalidVaultSharesDetected");
  }
}

export class CannotWithdrawBeforeRedeemPeriodEnd extends Error {
  static readonly code = 6003;
  readonly code = 6003;
  readonly name = "CannotWithdrawBeforeRedeemPeriodEnd";
  readonly msg = "CannotWithdrawBeforeRedeemPeriodEnd";

  constructor(readonly logs?: string[]) {
    super("6003: CannotWithdrawBeforeRedeemPeriodEnd");
  }
}

export class InvalidVaultWithdraw extends Error {
  static readonly code = 6004;
  readonly code = 6004;
  readonly name = "InvalidVaultWithdraw";
  readonly msg = "InvalidVaultWithdraw";

  constructor(readonly logs?: string[]) {
    super("6004: InvalidVaultWithdraw");
  }
}

export class InsufficientVaultShares extends Error {
  static readonly code = 6005;
  readonly code = 6005;
  readonly name = "InsufficientVaultShares";
  readonly msg = "InsufficientVaultShares";

  constructor(readonly logs?: string[]) {
    super("6005: InsufficientVaultShares");
  }
}

export class InvalidVaultWithdrawSize extends Error {
  static readonly code = 6006;
  readonly code = 6006;
  readonly name = "InvalidVaultWithdrawSize";
  readonly msg = "InvalidVaultWithdrawSize";

  constructor(readonly logs?: string[]) {
    super("6006: InvalidVaultWithdrawSize");
  }
}

export class InvalidVaultForNewDepositors extends Error {
  static readonly code = 6007;
  readonly code = 6007;
  readonly name = "InvalidVaultForNewDepositors";
  readonly msg = "InvalidVaultForNewDepositors";

  constructor(readonly logs?: string[]) {
    super("6007: InvalidVaultForNewDepositors");
  }
}

export class VaultWithdrawRequestInProgress extends Error {
  static readonly code = 6008;
  readonly code = 6008;
  readonly name = "VaultWithdrawRequestInProgress";
  readonly msg = "VaultWithdrawRequestInProgress";

  constructor(readonly logs?: string[]) {
    super("6008: VaultWithdrawRequestInProgress");
  }
}

export class VaultIsAtCapacity extends Error {
  static readonly code = 6009;
  readonly code = 6009;
  readonly name = "VaultIsAtCapacity";
  readonly msg = "VaultIsAtCapacity";

  constructor(readonly logs?: string[]) {
    super("6009: VaultIsAtCapacity");
  }
}

export class InvalidVaultDepositorInitialization extends Error {
  static readonly code = 6010;
  readonly code = 6010;
  readonly name = "InvalidVaultDepositorInitialization";
  readonly msg = "InvalidVaultDepositorInitialization";

  constructor(readonly logs?: string[]) {
    super("6010: InvalidVaultDepositorInitialization");
  }
}

export class DelegateNotAvailableForLiquidation extends Error {
  static readonly code = 6011;
  readonly code = 6011;
  readonly name = "DelegateNotAvailableForLiquidation";
  readonly msg = "DelegateNotAvailableForLiquidation";

  constructor(readonly logs?: string[]) {
    super("6011: DelegateNotAvailableForLiquidation");
  }
}

export class InvalidEquityValue extends Error {
  static readonly code = 6012;
  readonly code = 6012;
  readonly name = "InvalidEquityValue";
  readonly msg = "InvalidEquityValue";

  constructor(readonly logs?: string[]) {
    super("6012: InvalidEquityValue");
  }
}

export class VaultInLiquidation extends Error {
  static readonly code = 6013;
  readonly code = 6013;
  readonly name = "VaultInLiquidation";
  readonly msg = "VaultInLiquidation";

  constructor(readonly logs?: string[]) {
    super("6013: VaultInLiquidation");
  }
}

export class DriftError extends Error {
  static readonly code = 6014;
  readonly code = 6014;
  readonly name = "DriftError";
  readonly msg = "DriftError";

  constructor(readonly logs?: string[]) {
    super("6014: DriftError");
  }
}

export class InvalidVaultInitialization extends Error {
  static readonly code = 6015;
  readonly code = 6015;
  readonly name = "InvalidVaultInitialization";
  readonly msg = "InvalidVaultInitialization";

  constructor(readonly logs?: string[]) {
    super("6015: InvalidVaultInitialization");
  }
}

export class InvalidVaultUpdate extends Error {
  static readonly code = 6016;
  readonly code = 6016;
  readonly name = "InvalidVaultUpdate";
  readonly msg = "InvalidVaultUpdate";

  constructor(readonly logs?: string[]) {
    super("6016: InvalidVaultUpdate");
  }
}

export class PermissionedVault extends Error {
  static readonly code = 6017;
  readonly code = 6017;
  readonly name = "PermissionedVault";
  readonly msg = "PermissionedVault";

  constructor(readonly logs?: string[]) {
    super("6017: PermissionedVault");
  }
}

export class WithdrawInProgress extends Error {
  static readonly code = 6018;
  readonly code = 6018;
  readonly name = "WithdrawInProgress";
  readonly msg = "WithdrawInProgress";

  constructor(readonly logs?: string[]) {
    super("6018: WithdrawInProgress");
  }
}

export class SharesPercentTooLarge extends Error {
  static readonly code = 6019;
  readonly code = 6019;
  readonly name = "SharesPercentTooLarge";
  readonly msg = "SharesPercentTooLarge";

  constructor(readonly logs?: string[]) {
    super("6019: SharesPercentTooLarge");
  }
}

export class InvalidVaultDeposit extends Error {
  static readonly code = 6020;
  readonly code = 6020;
  readonly name = "InvalidVaultDeposit";
  readonly msg = "InvalidVaultDeposit";

  constructor(readonly logs?: string[]) {
    super("6020: InvalidVaultDeposit");
  }
}

export class OngoingLiquidation extends Error {
  static readonly code = 6021;
  readonly code = 6021;
  readonly name = "OngoingLiquidation";
  readonly msg = "OngoingLiquidation";

  constructor(readonly logs?: string[]) {
    super("6021: OngoingLiquidation");
  }
}

export class VaultProtocolMissing extends Error {
  static readonly code = 6022;
  readonly code = 6022;
  readonly name = "VaultProtocolMissing";
  readonly msg = "VaultProtocolMissing";

  constructor(readonly logs?: string[]) {
    super("6022: VaultProtocolMissing");
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new Default(logs);
    case 6001:
      return new InvalidVaultRebase(logs);
    case 6002:
      return new InvalidVaultSharesDetected(logs);
    case 6003:
      return new CannotWithdrawBeforeRedeemPeriodEnd(logs);
    case 6004:
      return new InvalidVaultWithdraw(logs);
    case 6005:
      return new InsufficientVaultShares(logs);
    case 6006:
      return new InvalidVaultWithdrawSize(logs);
    case 6007:
      return new InvalidVaultForNewDepositors(logs);
    case 6008:
      return new VaultWithdrawRequestInProgress(logs);
    case 6009:
      return new VaultIsAtCapacity(logs);
    case 6010:
      return new InvalidVaultDepositorInitialization(logs);
    case 6011:
      return new DelegateNotAvailableForLiquidation(logs);
    case 6012:
      return new InvalidEquityValue(logs);
    case 6013:
      return new VaultInLiquidation(logs);
    case 6014:
      return new DriftError(logs);
    case 6015:
      return new InvalidVaultInitialization(logs);
    case 6016:
      return new InvalidVaultUpdate(logs);
    case 6017:
      return new PermissionedVault(logs);
    case 6018:
      return new WithdrawInProgress(logs);
    case 6019:
      return new SharesPercentTooLarge(logs);
    case 6020:
      return new InvalidVaultDeposit(logs);
    case 6021:
      return new OngoingLiquidation(logs);
    case 6022:
      return new VaultProtocolMissing(logs);
  }

  return null;
}
