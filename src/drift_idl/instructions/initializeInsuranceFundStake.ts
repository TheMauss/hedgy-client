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
  spotMarket: PublicKey;
  insuranceFundStake: PublicKey;
  userStats: PublicKey;
  state: PublicKey;
  authority: PublicKey;
  payer: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u16("marketIndex")]);

export function initializeInsuranceFundStake(
  args: InitializeInsuranceFundStakeArgs,
  accounts: InitializeInsuranceFundStakeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.insuranceFundStake, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
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
