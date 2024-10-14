import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateHighLeverageModeConfigArgs {
  maxUsers: number;
  reduceOnly: boolean;
}

export interface UpdateHighLeverageModeConfigAccounts {
  admin: PublicKey;
  highLeverageModeConfig: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([
  borsh.u32("maxUsers"),
  borsh.bool("reduceOnly"),
]);

export function updateHighLeverageModeConfig(
  args: UpdateHighLeverageModeConfigArgs,
  accounts: UpdateHighLeverageModeConfigAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    {
      pubkey: accounts.highLeverageModeConfig,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([64, 122, 212, 93, 141, 217, 202, 55]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      maxUsers: args.maxUsers,
      reduceOnly: args.reduceOnly,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
