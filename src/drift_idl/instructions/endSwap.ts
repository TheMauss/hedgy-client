import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface EndSwapArgs {
  inMarketIndex: number;
  outMarketIndex: number;
  limitPrice: BN | null;
  reduceOnly: types.SwapReduceOnlyKind | null;
}

export interface EndSwapAccounts {
  state: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
  authority: PublicKey;
  outSpotMarketVault: PublicKey;
  inSpotMarketVault: PublicKey;
  outTokenAccount: PublicKey;
  inTokenAccount: PublicKey;
  tokenProgram: PublicKey;
  driftSigner: PublicKey;
  /** Instructions Sysvar for instruction introspection */
  instructions: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("inMarketIndex"),
  borsh.u16("outMarketIndex"),
  borsh.option(borsh.u64(), "limitPrice"),
  borsh.option(types.SwapReduceOnly.layout(), "reduceOnly"),
]);

export function endSwap(
  args: EndSwapArgs,
  accounts: EndSwapAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.outSpotMarketVault, isSigner: false, isWritable: true },
    { pubkey: accounts.inSpotMarketVault, isSigner: false, isWritable: true },
    { pubkey: accounts.outTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.inTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.instructions, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([177, 184, 27, 193, 34, 13, 210, 145]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      inMarketIndex: args.inMarketIndex,
      outMarketIndex: args.outMarketIndex,
      limitPrice: args.limitPrice,
      reduceOnly: (args.reduceOnly && args.reduceOnly.toEncodable()) || null,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
