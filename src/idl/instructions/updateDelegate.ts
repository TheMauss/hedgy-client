import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateDelegateArgs {
  delegate: PublicKey;
}

export interface UpdateDelegateAccounts {
  vault: PublicKey;
  manager: PublicKey;
  driftUser: PublicKey;
  driftProgram: PublicKey;
}

export const layout = borsh.struct([borsh.publicKey("delegate")]);

export function updateDelegate(
  args: UpdateDelegateArgs,
  accounts: UpdateDelegateAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.manager, isSigner: true, isWritable: false },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: true },
    { pubkey: accounts.driftProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([190, 202, 103, 138, 167, 197, 25, 9]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      delegate: args.delegate,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
