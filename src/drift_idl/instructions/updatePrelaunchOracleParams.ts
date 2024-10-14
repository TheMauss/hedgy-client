import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePrelaunchOracleParamsArgs {
  params: types.PrelaunchOracleParamsFields;
}

export interface UpdatePrelaunchOracleParamsAccounts {
  admin: PublicKey;
  prelaunchOracle: PublicKey;
  perpMarket: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([
  types.PrelaunchOracleParams.layout("params"),
]);

export function updatePrelaunchOracleParams(
  args: UpdatePrelaunchOracleParamsArgs,
  accounts: UpdatePrelaunchOracleParamsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.prelaunchOracle, isSigner: false, isWritable: true },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([98, 205, 147, 243, 18, 75, 83, 207]);
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
