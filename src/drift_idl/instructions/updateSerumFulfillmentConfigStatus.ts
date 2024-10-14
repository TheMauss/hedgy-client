import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSerumFulfillmentConfigStatusArgs {
  status: types.SpotFulfillmentConfigStatusKind;
}

export interface UpdateSerumFulfillmentConfigStatusAccounts {
  state: PublicKey;
  serumFulfillmentConfig: PublicKey;
  admin: PublicKey;
}

export const layout = borsh.struct([
  types.SpotFulfillmentConfigStatus.layout("status"),
]);

export function updateSerumFulfillmentConfigStatus(
  args: UpdateSerumFulfillmentConfigStatusArgs,
  accounts: UpdateSerumFulfillmentConfigStatusAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    {
      pubkey: accounts.serumFulfillmentConfig,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
  ];
  const identifier = Buffer.from([171, 109, 240, 251, 95, 1, 149, 89]);
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
