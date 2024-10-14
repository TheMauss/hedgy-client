import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateAmmsArgs {
  marketIndexes: Array<number>;
}

export interface UpdateAmmsAccounts {
  state: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  borsh.array(borsh.u16(), 5, "marketIndexes"),
]);

export function updateAmms(
  args: UpdateAmmsArgs,
  accounts: UpdateAmmsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([201, 106, 217, 253, 4, 175, 228, 97]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketIndexes: args.marketIndexes,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
