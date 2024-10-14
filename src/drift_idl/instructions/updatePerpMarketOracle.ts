import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketOracleArgs {
  oracle: PublicKey;
  oracleSource: types.OracleSourceKind;
}

export interface UpdatePerpMarketOracleAccounts {
  state: PublicKey;
  perpMarket: PublicKey;
  oracle: PublicKey;
  admin: PublicKey;
}

export const layout = borsh.struct([
  borsh.publicKey("oracle"),
  types.OracleSource.layout("oracleSource"),
]);

export function updatePerpMarketOracle(
  args: UpdatePerpMarketOracleArgs,
  accounts: UpdatePerpMarketOracleAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.oracle, isSigner: false, isWritable: false },
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([182, 113, 111, 160, 67, 174, 89, 191]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      oracle: args.oracle,
      oracleSource: args.oracleSource.toEncodable(),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
