import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PhoenixFulfillmentConfigStatusArgs {
  status: types.SpotFulfillmentConfigStatusKind;
}

export interface PhoenixFulfillmentConfigStatusAccounts {
  state: PublicKey;
  phoenixFulfillmentConfig: PublicKey;
  admin: PublicKey;
}

export const layout = borsh.struct([
  types.SpotFulfillmentConfigStatus.layout("status"),
]);

export function phoenixFulfillmentConfigStatus(
  args: PhoenixFulfillmentConfigStatusArgs,
  accounts: PhoenixFulfillmentConfigStatusAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    {
      pubkey: accounts.phoenixFulfillmentConfig,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
  ];
  const identifier = Buffer.from([96, 31, 113, 32, 12, 203, 7, 154]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      status: args.status.toEncodable(),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
