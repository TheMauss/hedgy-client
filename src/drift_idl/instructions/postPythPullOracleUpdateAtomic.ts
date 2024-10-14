import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PostPythPullOracleUpdateAtomicArgs {
  feedId: Array<number>;
  params: Uint8Array;
}

export interface PostPythPullOracleUpdateAtomicAccounts {
  keeper: PublicKey;
  pythSolanaReceiver: PublicKey;
  guardianSet: PublicKey;
  priceFeed: PublicKey;
}

export const layout = borsh.struct([
  borsh.array(borsh.u8(), 32, "feedId"),
  borsh.vecU8("params"),
]);

export function postPythPullOracleUpdateAtomic(
  args: PostPythPullOracleUpdateAtomicArgs,
  accounts: PostPythPullOracleUpdateAtomicAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.keeper, isSigner: true, isWritable: true },
    { pubkey: accounts.pythSolanaReceiver, isSigner: false, isWritable: false },
    { pubkey: accounts.guardianSet, isSigner: false, isWritable: false },
    { pubkey: accounts.priceFeed, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([116, 122, 137, 158, 224, 195, 173, 119]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      feedId: args.feedId,
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
