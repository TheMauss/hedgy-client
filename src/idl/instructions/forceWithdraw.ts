import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ForceWithdrawAccounts {
  vault: PublicKey;
  manager: PublicKey;
  vaultDepositor: PublicKey;
  vaultTokenAccount: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
  driftSpotMarketVault: PublicKey;
  driftSigner: PublicKey;
  userTokenAccount: PublicKey;
  driftProgram: PublicKey;
  tokenProgram: PublicKey;
}

export function forceWithdraw(
  accounts: ForceWithdrawAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.manager, isSigner: true, isWritable: false },
    { pubkey: accounts.vaultDepositor, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.driftUserStats, isSigner: false, isWritable: true },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: true },
    { pubkey: accounts.driftState, isSigner: false, isWritable: false },
    {
      pubkey: accounts.driftSpotMarketVault,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.driftProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([106, 41, 34, 48, 17, 177, 59, 255]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
