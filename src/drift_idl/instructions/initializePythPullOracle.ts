import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializePythPullOracleArgs {
  feedId: Array<number>;
}

export interface InitializePythPullOracleAccounts {
  admin: PublicKey;
  pythSolanaReceiver: PublicKey;
  priceFeed: PublicKey;
  systemProgram: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([borsh.array(borsh.u8(), 32, "feedId")]);

export function initializePythPullOracle(
  args: InitializePythPullOracleArgs,
  accounts: InitializePythPullOracleAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.pythSolanaReceiver, isSigner: false, isWritable: false },
    { pubkey: accounts.priceFeed, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([249, 140, 253, 243, 248, 74, 240, 238]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      feedId: args.feedId,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
