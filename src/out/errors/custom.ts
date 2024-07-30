export type CustomError =
  | InsufficientBalance
  | InitAccount
  | InvalidArguments
  | InvalidAccounts
  | ArithmeticError
  | StalePrice
  | InvalidOracle
  | DeppegedPair;

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
  }

  return null;
}
