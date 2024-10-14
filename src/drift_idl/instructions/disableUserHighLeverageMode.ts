import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface DisableUserHighLeverageModeAccounts {
  state: PublicKey;
  authority: PublicKey;
  user: PublicKey;
  highLeverageModeConfig: PublicKey;
}

export function disableUserHighLeverageMode(
  accounts: DisableUserHighLeverageModeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    {
      pubkey: accounts.highLeverageModeConfig,
      isSigner: false,
      isWritable: true,
    },
  ];
  const identifier = Buffer.from([183, 155, 45, 0, 226, 85, 213, 69]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
