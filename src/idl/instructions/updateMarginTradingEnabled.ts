import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateMarginTradingEnabledArgs {
  enabled: boolean;
}

export interface UpdateMarginTradingEnabledAccounts {
  vault: PublicKey;
  manager: PublicKey;
  driftUser: PublicKey;
  driftProgram: PublicKey;
}

export const layout = borsh.struct([borsh.bool("enabled")]);

export function updateMarginTradingEnabled(
  args: UpdateMarginTradingEnabledArgs,
  accounts: UpdateMarginTradingEnabledAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.manager, isSigner: true, isWritable: false },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: true },
    { pubkey: accounts.driftProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([244, 34, 229, 140, 91, 65, 200, 67]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      enabled: args.enabled,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
