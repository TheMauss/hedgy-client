export type CustomError =
  | ArithmeticError
  | MaxDepositsReached
  | StaleOracle
  | NoLiquidityInPool
  | TradeAmountReached
  | InvalidInstructions
  | InvalidAccounts
  | InvalidArguments
  | InvalidAccountData
  | ContractResolved
  | OrderResolved
  | OrderunResolved
  | HaltedTrading
  | FreshPrice
  | NotInitAccount
  | InitAccount
  | UserHasCode
  | UserHasNoCode
  | RefCodesDoNotMatch
  | AccountIsOld
  | WithdrawThreshold
  | InsufficientAmount
  | LockedPool
  | TooEarlyToClose;

export class ArithmeticError extends Error {
  static readonly code = 6000;
  readonly code = 6000;
  readonly name = "ArithmeticError";
  readonly msg = "Arithmetic Error within Calculation";

  constructor(readonly logs?: string[]) {
    super("6000: Arithmetic Error within Calculation");
  }
}

export class MaxDepositsReached extends Error {
  static readonly code = 6001;
  readonly code = 6001;
  readonly name = "MaxDepositsReached";
  readonly msg = "Max Deposits Reached";

  constructor(readonly logs?: string[]) {
    super("6001: Max Deposits Reached");
  }
}

export class StaleOracle extends Error {
  static readonly code = 6002;
  readonly code = 6002;
  readonly name = "StaleOracle";
  readonly msg = "Oracle is Stale";

  constructor(readonly logs?: string[]) {
    super("6002: Oracle is Stale");
  }
}

export class NoLiquidityInPool extends Error {
  static readonly code = 6003;
  readonly code = 6003;
  readonly name = "NoLiquidityInPool";
  readonly msg = "Pool is out for Liquidity for this Pool";

  constructor(readonly logs?: string[]) {
    super("6003: Pool is out for Liquidity for this Pool");
  }
}

export class TradeAmountReached extends Error {
  static readonly code = 6004;
  readonly code = 6004;
  readonly name = "TradeAmountReached";
  readonly msg = "User reached max Position Size";

  constructor(readonly logs?: string[]) {
    super("6004: User reached max Position Size");
  }
}

export class InvalidInstructions extends Error {
  static readonly code = 6005;
  readonly code = 6005;
  readonly name = "InvalidInstructions";
  readonly msg = "Invalid Instructions Supplied To the Program";

  constructor(readonly logs?: string[]) {
    super("6005: Invalid Instructions Supplied To the Program");
  }
}

export class InvalidAccounts extends Error {
  static readonly code = 6006;
  readonly code = 6006;
  readonly name = "InvalidAccounts";
  readonly msg = "Invalid Accounts Supplied To the Program";

  constructor(readonly logs?: string[]) {
    super("6006: Invalid Accounts Supplied To the Program");
  }
}

export class InvalidArguments extends Error {
  static readonly code = 6007;
  readonly code = 6007;
  readonly name = "InvalidArguments";
  readonly msg = "Invalid Argument Supplied To the Program";

  constructor(readonly logs?: string[]) {
    super("6007: Invalid Argument Supplied To the Program");
  }
}

export class InvalidAccountData extends Error {
  static readonly code = 6008;
  readonly code = 6008;
  readonly name = "InvalidAccountData";
  readonly msg = "Invalid Account Data within the Program";

  constructor(readonly logs?: string[]) {
    super("6008: Invalid Account Data within the Program");
  }
}

export class ContractResolved extends Error {
  static readonly code = 6009;
  readonly code = 6009;
  readonly name = "ContractResolved";
  readonly msg = "Position has been already Closed";

  constructor(readonly logs?: string[]) {
    super("6009: Position has been already Closed");
  }
}

export class OrderResolved extends Error {
  static readonly code = 6010;
  readonly code = 6010;
  readonly name = "OrderResolved";
  readonly msg = "Position is no longer Order";

  constructor(readonly logs?: string[]) {
    super("6010: Position is no longer Order");
  }
}

export class OrderunResolved extends Error {
  static readonly code = 6011;
  readonly code = 6011;
  readonly name = "OrderunResolved";
  readonly msg = "Position is still only Order";

  constructor(readonly logs?: string[]) {
    super("6011: Position is still only Order");
  }
}

export class HaltedTrading extends Error {
  static readonly code = 6012;
  readonly code = 6012;
  readonly name = "HaltedTrading";
  readonly msg = "Trading is Halted";

  constructor(readonly logs?: string[]) {
    super("6012: Trading is Halted");
  }
}

export class FreshPrice extends Error {
  static readonly code = 6013;
  readonly code = 6013;
  readonly name = "FreshPrice";
  readonly msg = "Price is not Stale";

  constructor(readonly logs?: string[]) {
    super("6013: Price is not Stale");
  }
}

export class NotInitAccount extends Error {
  static readonly code = 6014;
  readonly code = 6014;
  readonly name = "NotInitAccount";
  readonly msg = "Account is not Initialized";

  constructor(readonly logs?: string[]) {
    super("6014: Account is not Initialized");
  }
}

export class InitAccount extends Error {
  static readonly code = 6015;
  readonly code = 6015;
  readonly name = "InitAccount";
  readonly msg = "Account is  Initialized";

  constructor(readonly logs?: string[]) {
    super("6015: Account is  Initialized");
  }
}

export class UserHasCode extends Error {
  static readonly code = 6016;
  readonly code = 6016;
  readonly name = "UserHasCode";
  readonly msg = "Account has already Ref Code";

  constructor(readonly logs?: string[]) {
    super("6016: Account has already Ref Code");
  }
}

export class UserHasNoCode extends Error {
  static readonly code = 6017;
  readonly code = 6017;
  readonly name = "UserHasNoCode";
  readonly msg = "Account has no Ref Code";

  constructor(readonly logs?: string[]) {
    super("6017: Account has no Ref Code");
  }
}

export class RefCodesDoNotMatch extends Error {
  static readonly code = 6018;
  readonly code = 6018;
  readonly name = "RefCodesDoNotMatch";
  readonly msg = "The Codes Do not Match";

  constructor(readonly logs?: string[]) {
    super("6018: The Codes Do not Match");
  }
}

export class AccountIsOld extends Error {
  static readonly code = 6019;
  readonly code = 6019;
  readonly name = "AccountIsOld";
  readonly msg = "Can not use Ref Code on Accounts older than 24 hours";

  constructor(readonly logs?: string[]) {
    super("6019: Can not use Ref Code on Accounts older than 24 hours");
  }
}

export class WithdrawThreshold extends Error {
  static readonly code = 6020;
  readonly code = 6020;
  readonly name = "WithdrawThreshold";
  readonly msg = "You can claim minimum of 0.1 SOL";

  constructor(readonly logs?: string[]) {
    super("6020: You can claim minimum of 0.1 SOL");
  }
}

export class InsufficientAmount extends Error {
  static readonly code = 6021;
  readonly code = 6021;
  readonly name = "InsufficientAmount";
  readonly msg = "Insufficient Amount of SPL token";

  constructor(readonly logs?: string[]) {
    super("6021: Insufficient Amount of SPL token");
  }
}

export class LockedPool extends Error {
  static readonly code = 6022;
  readonly code = 6022;
  readonly name = "LockedPool";
  readonly msg = "Liquidity Pool is Locked";

  constructor(readonly logs?: string[]) {
    super("6022: Liquidity Pool is Locked");
  }
}

export class TooEarlyToClose extends Error {
  static readonly code = 6023;
  readonly code = 6023;
  readonly name = "TooEarlyToClose";
  readonly msg = "Can not close position within 7 seconds of Opening";

  constructor(readonly logs?: string[]) {
    super("6023: Can not close position within 7 seconds of Opening");
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new ArithmeticError(logs);
    case 6001:
      return new MaxDepositsReached(logs);
    case 6002:
      return new StaleOracle(logs);
    case 6003:
      return new NoLiquidityInPool(logs);
    case 6004:
      return new TradeAmountReached(logs);
    case 6005:
      return new InvalidInstructions(logs);
    case 6006:
      return new InvalidAccounts(logs);
    case 6007:
      return new InvalidArguments(logs);
    case 6008:
      return new InvalidAccountData(logs);
    case 6009:
      return new ContractResolved(logs);
    case 6010:
      return new OrderResolved(logs);
    case 6011:
      return new OrderunResolved(logs);
    case 6012:
      return new HaltedTrading(logs);
    case 6013:
      return new FreshPrice(logs);
    case 6014:
      return new NotInitAccount(logs);
    case 6015:
      return new InitAccount(logs);
    case 6016:
      return new UserHasCode(logs);
    case 6017:
      return new UserHasNoCode(logs);
    case 6018:
      return new RefCodesDoNotMatch(logs);
    case 6019:
      return new AccountIsOld(logs);
    case 6020:
      return new WithdrawThreshold(logs);
    case 6021:
      return new InsufficientAmount(logs);
    case 6022:
      return new LockedPool(logs);
    case 6023:
      return new TooEarlyToClose(logs);
  }

  return null;
}
