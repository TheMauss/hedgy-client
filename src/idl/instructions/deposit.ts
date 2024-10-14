import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface DepositArgs {
  amount: BN;
}

export interface DepositAccounts {
  vault: PublicKey;
  vaultDepositor: PublicKey;
  authority: PublicKey;
  vaultTokenAccount: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
  driftSpotMarketVault: PublicKey;
  userTokenAccount: PublicKey;
  driftProgram: PublicKey;
  tokenProgram: PublicKey;
  oracleAddress: PublicKey; // Add account 12
  spotMarketAddress: PublicKey; // Add account 13 (Drift Spot Market)
}

export const layout = borsh.struct([borsh.u64("amount")]);

export function deposit(
  args: DepositArgs,
  accounts: DepositAccounts,
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
    { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.driftProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleAddress, isSigner: false, isWritable: false }, // Add account 12
    { pubkey: accounts.spotMarketAddress, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      amount: args.amount,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
