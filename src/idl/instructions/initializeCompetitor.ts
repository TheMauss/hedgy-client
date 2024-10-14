import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializeCompetitorAccounts {
  vault: PublicKey;
  manager: PublicKey;
  payer: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
  competitor: PublicKey;
  driftCompetitions: PublicKey;
  driftUserStats: PublicKey;
  driftCompetitionsProgram: PublicKey;
}

export function initializeCompetitor(
  accounts: InitializeCompetitorAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.manager, isSigner: true, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.competitor, isSigner: false, isWritable: true },
    { pubkey: accounts.driftCompetitions, isSigner: false, isWritable: true },
    { pubkey: accounts.driftUserStats, isSigner: false, isWritable: true },
    {
      pubkey: accounts.driftCompetitionsProgram,
      isSigner: false,
      isWritable: false,
    },
  ];
  const identifier = Buffer.from([82, 5, 7, 152, 20, 115, 34, 109]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
