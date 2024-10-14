import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PostMultiPythPullOracleUpdatesAtomicArgs {
  params: Uint8Array;
}

export interface PostMultiPythPullOracleUpdatesAtomicAccounts {
  keeper: PublicKey;
  pythSolanaReceiver: PublicKey;
  guardianSet: PublicKey;
}

export const layout = borsh.struct([borsh.vecU8("params")]);

export function postMultiPythPullOracleUpdatesAtomic(
  args: PostMultiPythPullOracleUpdatesAtomicArgs,
  accounts: PostMultiPythPullOracleUpdatesAtomicAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.keeper, isSigner: true, isWritable: true },
    { pubkey: accounts.pythSolanaReceiver, isSigner: false, isWritable: false },
    { pubkey: accounts.guardianSet, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([243, 79, 204, 228, 227, 208, 100, 244]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: Buffer.from(
        args.params.buffer,
        args.params.byteOffset,
        args.params.length
      ),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
