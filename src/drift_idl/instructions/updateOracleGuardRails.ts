import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateOracleGuardRailsArgs {
  oracleGuardRails: types.OracleGuardRailsFields;
}

export interface UpdateOracleGuardRailsAccounts {
  admin: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([
  types.OracleGuardRails.layout("oracleGuardRails"),
]);

export function updateOracleGuardRails(
  args: UpdateOracleGuardRailsArgs,
  accounts: UpdateOracleGuardRailsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([131, 112, 10, 59, 32, 54, 40, 164]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      oracleGuardRails: types.OracleGuardRails.toEncodable(
        args.oracleGuardRails
      ),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
