import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketOracleArgs {
  oracle: PublicKey;
  oracleSource: types.OracleSourceKind;
}

export interface UpdateSpotMarketOracleAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
  oracle: PublicKey;
}

export const layout = borsh.struct([
  borsh.publicKey("oracle"),
  types.OracleSource.layout("oracleSource"),
]);

export function updateSpotMarketOracle(
  args: UpdateSpotMarketOracleArgs,
  accounts: UpdateSpotMarketOracleAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.oracle, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([114, 184, 102, 37, 246, 186, 180, 99]);
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
