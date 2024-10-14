import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateWhitelistMintArgs {
  whitelistMint: PublicKey;
}

export interface UpdateWhitelistMintAccounts {
  admin: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([borsh.publicKey("whitelistMint")]);

export function updateWhitelistMint(
  args: UpdateWhitelistMintArgs,
  accounts: UpdateWhitelistMintAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([161, 15, 162, 19, 148, 120, 144, 151]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      whitelistMint: args.whitelistMint,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
