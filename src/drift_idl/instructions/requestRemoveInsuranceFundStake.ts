import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface RequestRemoveInsuranceFundStakeArgs {
  marketIndex: number;
  amount: BN;
}

export interface RequestRemoveInsuranceFundStakeAccounts {
  spotMarket: PublicKey;
  insuranceFundStake: PublicKey;
  userStats: PublicKey;
  authority: PublicKey;
  insuranceFundVault: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("marketIndex"),
  borsh.u64("amount"),
]);

export function requestRemoveInsuranceFundStake(
  args: RequestRemoveInsuranceFundStakeArgs,
  accounts: RequestRemoveInsuranceFundStakeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.insuranceFundStake, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.insuranceFundVault, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([142, 70, 204, 92, 73, 106, 180, 52]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketIndex: args.marketIndex,
      amount: args.amount,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
