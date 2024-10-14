import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ResolvePerpPnlDeficitArgs {
  spotMarketIndex: number;
  perpMarketIndex: number;
}

export interface ResolvePerpPnlDeficitAccounts {
  state: PublicKey;
  authority: PublicKey;
  spotMarketVault: PublicKey;
  insuranceFundVault: PublicKey;
  driftSigner: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("spotMarketIndex"),
  borsh.u16("perpMarketIndex"),
]);

export function resolvePerpPnlDeficit(
  args: ResolvePerpPnlDeficitArgs,
  accounts: ResolvePerpPnlDeficitAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.spotMarketVault, isSigner: false, isWritable: true },
    { pubkey: accounts.insuranceFundVault, isSigner: false, isWritable: true },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([168, 204, 68, 150, 159, 126, 95, 148]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      spotMarketIndex: args.spotMarketIndex,
      perpMarketIndex: args.perpMarketIndex,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
