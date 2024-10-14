import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializePrelaunchOracleArgs {
  params: types.PrelaunchOracleParamsFields;
}

export interface InitializePrelaunchOracleAccounts {
  admin: PublicKey;
  prelaunchOracle: PublicKey;
  state: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([
  types.PrelaunchOracleParams.layout("params"),
]);

export function initializePrelaunchOracle(
  args: InitializePrelaunchOracleArgs,
  accounts: InitializePrelaunchOracleAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.prelaunchOracle, isSigner: false, isWritable: true },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([169, 178, 84, 25, 175, 62, 29, 247]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.PrelaunchOracleParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
