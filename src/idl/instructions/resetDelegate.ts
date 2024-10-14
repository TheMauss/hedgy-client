import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ResetDelegateAccounts {
  vault: PublicKey;
  authority: PublicKey;
  driftUser: PublicKey;
  driftProgram: PublicKey;
}

export function resetDelegate(
  accounts: ResetDelegateAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: true },
    { pubkey: accounts.driftProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([204, 13, 61, 153, 97, 83, 146, 98]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
