export type CustomError =
  | InsufficientBalance
  | InitAccount
  | InvalidArguments
  | InvalidAccounts
  | ArithmeticError
  | StalePrice
  | InvalidOracle
  | DeppegedPair
  | NotDeppegedPair
  | WrongWithdrawFunction
  | NotEnoughParticipants
  | RandomnessSlotMismatch
  | InsufficientRandomness
  | RandomnessAlreadyRevealed
  | LotteryDidNotHappen
  | LotteryDidHappen
  | LotteryTimeIsnotUp
  | LotteryTimeIsUp
  | DeserializationError
  | NegativeYieldError
  | BigLotteryFirst
  | BigLotteryCommitFirst
  | MaxDepositReached
  | SizeConversionError
  | RandomnessAccountConflict
  | CommitNotFresh
  | CommitHappened
  | CommitNotHappened
  | HourUpdateisnotUp
  | TooLateToDeposit;

export class InsufficientBalance extends Error {
  static readonly code = 6000;
  readonly code = 6000;
  readonly name = "InsufficientBalance";
  readonly msg = "Insufficient balance";

  constructor(readonly logs?: string[]) {
    super("6000: Insufficient balance");
  }
}

export class InitAccount extends Error {
  static readonly code = 6001;
  readonly code = 6001;
  readonly name = "InitAccount";
  readonly msg = "Account is Initialized";

  constructor(readonly logs?: string[]) {
    super("6001: Account is Initialized");
  }
}

export class InvalidArguments extends Error {
  static readonly code = 6002;
  readonly code = 6002;
  readonly name = "InvalidArguments";
  readonly msg = "Invalid Argument Supplied To the Program";

  constructor(readonly logs?: string[]) {
    super("6002: Invalid Argument Supplied To the Program");
  }
}

export class InvalidAccounts extends Error {
  static readonly code = 6003;
  readonly code = 6003;
  readonly name = "InvalidAccounts";
  readonly msg = "Invalid Accounts Supplied To the Program";

  constructor(readonly logs?: string[]) {
    super("6003: Invalid Accounts Supplied To the Program");
  }
}

export class ArithmeticError extends Error {
  static readonly code = 6004;
  readonly code = 6004;
  readonly name = "ArithmeticError";
  readonly msg = "Arithmetic Error";

  constructor(readonly logs?: string[]) {
    super("6004: Arithmetic Error");
  }
}

export class StalePrice extends Error {
  static readonly code = 6005;
  readonly code = 6005;
  readonly name = "StalePrice";
  readonly msg =
    "Pyth Price is Stale or there was an error fetching the price.";

  constructor(readonly logs?: string[]) {
    super(
      "6005: Pyth Price is Stale or there was an error fetching the price."
    );
  }
}

export class InvalidOracle extends Error {
  static readonly code = 6006;
  readonly code = 6006;
  readonly name = "InvalidOracle";
  readonly msg = "Only SOL and INF are supported.";

  constructor(readonly logs?: string[]) {
    super("6006: Only SOL and INF are supported.");
  }
}

export class DeppegedPair extends Error {
  static readonly code = 6007;
  readonly code = 6007;
  readonly name = "DeppegedPair";
  readonly msg = "Pairs are deppeged.";

  constructor(readonly logs?: string[]) {
    super("6007: Pairs are deppeged.");
  }
}

export class NotDeppegedPair extends Error {
  static readonly code = 6008;
  readonly code = 6008;
  readonly name = "NotDeppegedPair";
  readonly msg = "Pairs are not deppeged, not need for delay.";

  constructor(readonly logs?: string[]) {
    super("6008: Pairs are not deppeged, not need for delay.");
  }
}

export class WrongWithdrawFunction extends Error {
  static readonly code = 6009;
  readonly code = 6009;
  readonly name = "WrongWithdrawFunction";
  readonly msg = "Wrong Withdraw Function.";

  constructor(readonly logs?: string[]) {
    super("6009: Wrong Withdraw Function.");
  }
}

export class NotEnoughParticipants extends Error {
  static readonly code = 6010;
  readonly code = 6010;
  readonly name = "NotEnoughParticipants";
  readonly msg = "Not enough participants for lottery";

  constructor(readonly logs?: string[]) {
    super("6010: Not enough participants for lottery");
  }
}

export class RandomnessSlotMismatch extends Error {
  static readonly code = 6011;
  readonly code = 6011;
  readonly name = "RandomnessSlotMismatch";
  readonly msg = "Randomness slot mismatch";

  constructor(readonly logs?: string[]) {
    super("6011: Randomness slot mismatch");
  }
}

export class InsufficientRandomness extends Error {
  static readonly code = 6012;
  readonly code = 6012;
  readonly name = "InsufficientRandomness";
  readonly msg = "InsufficientRandomness";

  constructor(readonly logs?: string[]) {
    super("6012: InsufficientRandomness");
  }
}

export class RandomnessAlreadyRevealed extends Error {
  static readonly code = 6013;
  readonly code = 6013;
  readonly name = "RandomnessAlreadyRevealed";
  readonly msg = "This slot has been already used";

  constructor(readonly logs?: string[]) {
    super("6013: This slot has been already used");
  }
}

export class LotteryDidNotHappen extends Error {
  static readonly code = 6014;
  readonly code = 6014;
  readonly name = "LotteryDidNotHappen";
  readonly msg = "Lottery did not happen yet";

  constructor(readonly logs?: string[]) {
    super("6014: Lottery did not happen yet");
  }
}

export class LotteryDidHappen extends Error {
  static readonly code = 6015;
  readonly code = 6015;
  readonly name = "LotteryDidHappen";
  readonly msg = "Wait for setting up Timer";

  constructor(readonly logs?: string[]) {
    super("6015: Wait for setting up Timer");
  }
}

export class LotteryTimeIsnotUp extends Error {
  static readonly code = 6016;
  readonly code = 6016;
  readonly name = "LotteryTimeIsnotUp";
  readonly msg = "Lottery is happening in future";

  constructor(readonly logs?: string[]) {
    super("6016: Lottery is happening in future");
  }
}

export class LotteryTimeIsUp extends Error {
  static readonly code = 6017;
  readonly code = 6017;
  readonly name = "LotteryTimeIsUp";
  readonly msg = "Lottery should have happened alreadz";

  constructor(readonly logs?: string[]) {
    super("6017: Lottery should have happened alreadz");
  }
}

export class DeserializationError extends Error {
  static readonly code = 6018;
  readonly code = 6018;
  readonly name = "DeserializationError";
  readonly msg = "Deserialization Error";

  constructor(readonly logs?: string[]) {
    super("6018: Deserialization Error");
  }
}

export class NegativeYieldError extends Error {
  static readonly code = 6019;
  readonly code = 6019;
  readonly name = "NegativeYieldError";
  readonly msg = "Lottery Yield can not be negative";

  constructor(readonly logs?: string[]) {
    super("6019: Lottery Yield can not be negative");
  }
}

export class BigLotteryFirst extends Error {
  static readonly code = 6020;
  readonly code = 6020;
  readonly name = "BigLotteryFirst";
  readonly msg = "Draw Big Lottery First";

  constructor(readonly logs?: string[]) {
    super("6020: Draw Big Lottery First");
  }
}

export class BigLotteryCommitFirst extends Error {
  static readonly code = 6021;
  readonly code = 6021;
  readonly name = "BigLotteryCommitFirst";
  readonly msg = "Commit Big Lottery First";

  constructor(readonly logs?: string[]) {
    super("6021: Commit Big Lottery First");
  }
}

export class MaxDepositReached extends Error {
  static readonly code = 6022;
  readonly code = 6022;
  readonly name = "MaxDepositReached";
  readonly msg = "Maximum Deposit per User has been reached";

  constructor(readonly logs?: string[]) {
    super("6022: Maximum Deposit per User has been reached");
  }
}

export class SizeConversionError extends Error {
  static readonly code = 6023;
  readonly code = 6023;
  readonly name = "SizeConversionError";
  readonly msg = "Size account Error";

  constructor(readonly logs?: string[]) {
    super("6023: Size account Error");
  }
}

export class RandomnessAccountConflict extends Error {
  static readonly code = 6024;
  readonly code = 6024;
  readonly name = "RandomnessAccountConflict";
  readonly msg = "Accounts can not be the Same";

  constructor(readonly logs?: string[]) {
    super("6024: Accounts can not be the Same");
  }
}

export class CommitNotFresh extends Error {
  static readonly code = 6025;
  readonly code = 6025;
  readonly name = "CommitNotFresh";
  readonly msg = "Commit has to happen within 30 minutes of reveal";

  constructor(readonly logs?: string[]) {
    super("6025: Commit has to happen within 30 minutes of reveal");
  }
}

export class CommitHappened extends Error {
  static readonly code = 6026;
  readonly code = 6026;
  readonly name = "CommitHappened";
  readonly msg = "Commit already happened";

  constructor(readonly logs?: string[]) {
    super("6026: Commit already happened");
  }
}

export class CommitNotHappened extends Error {
  static readonly code = 6027;
  readonly code = 6027;
  readonly name = "CommitNotHappened";
  readonly msg = "Commit the randomness first";

  constructor(readonly logs?: string[]) {
    super("6027: Commit the randomness first");
  }
}

export class HourUpdateisnotUp extends Error {
  static readonly code = 6028;
  readonly code = 6028;
  readonly name = "HourUpdateisnotUp";
  readonly msg = "Too soon to update hours";

  constructor(readonly logs?: string[]) {
    super("6028: Too soon to update hours");
  }
}

export class TooLateToDeposit extends Error {
  static readonly code = 6029;
  readonly code = 6029;
  readonly name = "TooLateToDeposit";
  readonly msg = "It is too late to deposit, wait one Hour";

  constructor(readonly logs?: string[]) {
    super("6029: It is too late to deposit, wait one Hour");
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new InsufficientBalance(logs);
    case 6001:
      return new InitAccount(logs);
    case 6002:
      return new InvalidArguments(logs);
    case 6003:
      return new InvalidAccounts(logs);
    case 6004:
      return new ArithmeticError(logs);
    case 6005:
      return new StalePrice(logs);
    case 6006:
      return new InvalidOracle(logs);
    case 6007:
      return new DeppegedPair(logs);
    case 6008:
      return new NotDeppegedPair(logs);
    case 6009:
      return new WrongWithdrawFunction(logs);
    case 6010:
      return new NotEnoughParticipants(logs);
    case 6011:
      return new RandomnessSlotMismatch(logs);
    case 6012:
      return new InsufficientRandomness(logs);
    case 6013:
      return new RandomnessAlreadyRevealed(logs);
    case 6014:
      return new LotteryDidNotHappen(logs);
    case 6015:
      return new LotteryDidHappen(logs);
    case 6016:
      return new LotteryTimeIsnotUp(logs);
    case 6017:
      return new LotteryTimeIsUp(logs);
    case 6018:
      return new DeserializationError(logs);
    case 6019:
      return new NegativeYieldError(logs);
    case 6020:
      return new BigLotteryFirst(logs);
    case 6021:
      return new BigLotteryCommitFirst(logs);
    case 6022:
      return new MaxDepositReached(logs);
    case 6023:
      return new SizeConversionError(logs);
    case 6024:
      return new RandomnessAccountConflict(logs);
    case 6025:
      return new CommitNotFresh(logs);
    case 6026:
      return new CommitHappened(logs);
    case 6027:
      return new CommitNotHappened(logs);
    case 6028:
      return new HourUpdateisnotUp(logs);
    case 6029:
      return new TooLateToDeposit(logs);
  }

  return null;
}
