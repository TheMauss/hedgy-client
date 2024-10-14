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
