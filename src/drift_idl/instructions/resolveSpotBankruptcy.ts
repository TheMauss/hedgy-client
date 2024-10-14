import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ResolveSpotBankruptcyArgs {
  marketIndex: number;
}

export interface ResolveSpotBankruptcyAccounts {
  state: PublicKey;
  authority: PublicKey;
  liquidator: PublicKey;
  liquidatorStats: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
  spotMarketVault: PublicKey;
  insuranceFundVault: PublicKey;
  driftSigner: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u16("marketIndex")]);

export function resolveSpotBankruptcy(
  args: ResolveSpotBankruptcyArgs,
  accounts: ResolveSpotBankruptcyAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.liquidator, isSigner: false, isWritable: true },
    { pubkey: accounts.liquidatorStats, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.spotMarketVault, isSigner: false, isWritable: true },
    { pubkey: accounts.insuranceFundVault, isSigner: false, isWritable: true },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([124, 194, 240, 254, 198, 213, 52, 122]);
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
