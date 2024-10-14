import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ApplyProfitShareAccounts {
  vault: PublicKey;
  vaultDepositor: PublicKey;
  manager: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
  driftSigner: PublicKey;
  driftProgram: PublicKey;
}

export function applyProfitShare(
  accounts: ApplyProfitShareAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultDepositor, isSigner: false, isWritable: true },
    { pubkey: accounts.manager, isSigner: true, isWritable: false },
    { pubkey: accounts.driftUserStats, isSigner: false, isWritable: true },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: true },
    { pubkey: accounts.driftState, isSigner: false, isWritable: false },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.driftProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([112, 235, 54, 165, 178, 81, 25, 10]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
