import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface MangerCancelWithdrawRequestAccounts {
  vault: PublicKey;
  manager: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
}

export function mangerCancelWithdrawRequest(
  accounts: MangerCancelWithdrawRequestAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.manager, isSigner: true, isWritable: false },
    { pubkey: accounts.driftUserStats, isSigner: false, isWritable: false },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: false },
    { pubkey: accounts.driftState, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([235, 253, 32, 176, 145, 94, 162, 244]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
