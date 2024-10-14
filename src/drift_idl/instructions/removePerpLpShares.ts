import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface RemovePerpLpSharesArgs {
  sharesToBurn: BN;
  marketIndex: number;
}

export interface RemovePerpLpSharesAccounts {
  state: PublicKey;
  user: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("sharesToBurn"),
  borsh.u16("marketIndex"),
]);

export function removePerpLpShares(
  args: RemovePerpLpSharesArgs,
  accounts: RemovePerpLpSharesAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([213, 89, 217, 18, 160, 55, 53, 141]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      sharesToBurn: args.sharesToBurn,
      marketIndex: args.marketIndex,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
