import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateLpCooldownTimeArgs {
  lpCooldownTime: BN;
}

export interface UpdateLpCooldownTimeAccounts {
  admin: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([borsh.u64("lpCooldownTime")]);

export function updateLpCooldownTime(
  args: UpdateLpCooldownTimeArgs,
  accounts: UpdateLpCooldownTimeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([198, 133, 88, 41, 241, 119, 61, 14]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      lpCooldownTime: args.lpCooldownTime,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
