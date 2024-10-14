import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface EnableUserHighLeverageModeArgs {
  subAccountId: number;
}

export interface EnableUserHighLeverageModeAccounts {
  state: PublicKey;
  user: PublicKey;
  authority: PublicKey;
  highLeverageModeConfig: PublicKey;
}

export const layout = borsh.struct([borsh.u16("subAccountId")]);

export function enableUserHighLeverageMode(
  args: EnableUserHighLeverageModeArgs,
  accounts: EnableUserHighLeverageModeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    {
      pubkey: accounts.highLeverageModeConfig,
      isSigner: false,
      isWritable: true,
    },
  ];
  const identifier = Buffer.from([231, 24, 230, 112, 201, 173, 73, 184]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      subAccountId: args.subAccountId,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
