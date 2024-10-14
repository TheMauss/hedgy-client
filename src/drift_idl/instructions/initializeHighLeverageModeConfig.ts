import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializeHighLeverageModeConfigArgs {
  maxUsers: number;
}

export interface InitializeHighLeverageModeConfigAccounts {
  admin: PublicKey;
  highLeverageModeConfig: PublicKey;
  state: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u32("maxUsers")]);

export function initializeHighLeverageModeConfig(
  args: InitializeHighLeverageModeConfigArgs,
  accounts: InitializeHighLeverageModeConfigAccounts,
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
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([213, 167, 93, 246, 208, 130, 90, 248]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      maxUsers: args.maxUsers,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
