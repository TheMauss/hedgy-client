import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface OpenbookV2FulfillmentConfigStatusArgs {
  status: types.SpotFulfillmentConfigStatusKind;
}

export interface OpenbookV2FulfillmentConfigStatusAccounts {
  state: PublicKey;
  openbookV2FulfillmentConfig: PublicKey;
  admin: PublicKey;
}

export const layout = borsh.struct([
  types.SpotFulfillmentConfigStatus.layout("status"),
]);

export function openbookV2FulfillmentConfigStatus(
  args: OpenbookV2FulfillmentConfigStatusArgs,
  accounts: OpenbookV2FulfillmentConfigStatusAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    {
      pubkey: accounts.openbookV2FulfillmentConfig,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
  ];
  const identifier = Buffer.from([25, 173, 19, 189, 4, 211, 64, 238]);
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
