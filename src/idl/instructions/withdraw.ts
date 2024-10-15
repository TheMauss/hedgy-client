import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface WithdrawAccounts {
  vault: PublicKey;
  vaultDepositor: PublicKey;
  authority: PublicKey;
  vaultTokenAccount: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
  driftSpotMarketVault: PublicKey;
  driftSigner: PublicKey;
  userTokenAccount: PublicKey;
  driftProgram: PublicKey;
  tokenProgram: PublicKey;
  oracleAddress: PublicKey; // Add account 12
  acc12: PublicKey; // Add account 14
  acc13: PublicKey; // Add account 15
  acc14: PublicKey; // Add account 16
  acc15: PublicKey; // Add account 17
  acc16: PublicKey; // Add account 18
  spotMarketAddress: PublicKey; // Add account 13 (Drift Spot Market)
  acc17: PublicKey; // Add account 19
  acc18: PublicKey; // Add account 20
  acc19: PublicKey; // Add account 21
  acc20: PublicKey; // Add account 22
  acc21: PublicKey; // Add account 22
}

export function withdraw(
  accounts: WithdrawAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultDepositor, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
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
    { pubkey: accounts.oracleAddress, isSigner: false, isWritable: false }, // Add account 12
    { pubkey: accounts.acc12, isSigner: false, isWritable: false }, // Add account 14
    { pubkey: accounts.acc13, isSigner: false, isWritable: false }, // Add account 15
    { pubkey: accounts.acc14, isSigner: false, isWritable: false }, // Add account 16
    { pubkey: accounts.acc15, isSigner: false, isWritable: false }, // Add account 17
    { pubkey: accounts.acc16, isSigner: false, isWritable: false }, // Add account 18
    { pubkey: accounts.spotMarketAddress, isSigner: false, isWritable: true }, // Add account 13
    { pubkey: accounts.acc17, isSigner: false, isWritable: false }, // Add account 19
    { pubkey: accounts.acc18, isSigner: false, isWritable: false }, // Add account 20
    { pubkey: accounts.acc19, isSigner: false, isWritable: false }, // Add account 21
    { pubkey: accounts.acc20, isSigner: false, isWritable: false }, // Add account 22
    { pubkey: accounts.acc21, isSigner: false, isWritable: false }, // Add account 22
  ];
  const identifier = Buffer.from([183, 18, 70, 156, 148, 109, 161, 34]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
