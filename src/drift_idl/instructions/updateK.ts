import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateKArgs {
  sqrtK: BN;
}

export interface UpdateKAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
  oracle: PublicKey;
}

export const layout = borsh.struct([borsh.u128("sqrtK")]);

export function updateK(
  args: UpdateKArgs,
  accounts: UpdateKAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.oracle, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([72, 98, 9, 139, 129, 229, 172, 56]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      sqrtK: args.sqrtK,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
