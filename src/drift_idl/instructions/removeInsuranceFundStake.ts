import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface RemoveInsuranceFundStakeArgs {
  marketIndex: number;
}

export interface RemoveInsuranceFundStakeAccounts {
  state: PublicKey;
  spotMarket: PublicKey;
  insuranceFundStake: PublicKey;
  userStats: PublicKey;
  authority: PublicKey;
  insuranceFundVault: PublicKey;
  driftSigner: PublicKey;
  userTokenAccount: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u16("marketIndex")]);

export function removeInsuranceFundStake(
  args: RemoveInsuranceFundStakeArgs,
  accounts: RemoveInsuranceFundStakeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.insuranceFundStake, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.insuranceFundVault, isSigner: false, isWritable: true },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([128, 166, 142, 9, 254, 187, 143, 174]);
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
