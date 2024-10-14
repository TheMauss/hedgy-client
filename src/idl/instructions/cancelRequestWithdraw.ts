import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CancelRequestWithdrawAccounts {
  vault: PublicKey;
  vaultDepositor: PublicKey;
  authority: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
  oracleAddress: PublicKey; // Add account 12
  spotMarketAddress: PublicKey;
}

export function cancelRequestWithdraw(
  accounts: CancelRequestWithdrawAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultDepositor, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.driftUserStats, isSigner: false, isWritable: false },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: false },
    { pubkey: accounts.driftState, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleAddress, isSigner: false, isWritable: false }, // Add account 12
    { pubkey: accounts.spotMarketAddress, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([26, 109, 1, 81, 102, 15, 6, 106]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
