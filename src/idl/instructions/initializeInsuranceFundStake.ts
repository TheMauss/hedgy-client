import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializeInsuranceFundStakeArgs {
  marketIndex: number;
}

export interface InitializeInsuranceFundStakeAccounts {
  vault: PublicKey;
  manager: PublicKey;
  payer: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
  driftSpotMarket: PublicKey;
  insuranceFundStake: PublicKey;
  driftUserStats: PublicKey;
  driftState: PublicKey;
  driftProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u16("marketIndex")]);

export function initializeInsuranceFundStake(
  args: InitializeInsuranceFundStakeArgs,
  accounts: InitializeInsuranceFundStakeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.manager, isSigner: true, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.driftSpotMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.insuranceFundStake, isSigner: false, isWritable: true },
    { pubkey: accounts.driftUserStats, isSigner: false, isWritable: true },
    { pubkey: accounts.driftState, isSigner: false, isWritable: false },
    { pubkey: accounts.driftProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([187, 179, 243, 70, 248, 90, 92, 147]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketIndex: args.marketIndex,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
