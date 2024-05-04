import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CloseFutContAccounts {
  futCont: PublicKey;
  playerAcc: PublicKey;
}

export function closeFutCont(
  accounts: CloseFutContAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.futCont, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: true, isWritable: true },
  ];
  const identifier = Buffer.from([96, 96, 224, 79, 243, 208, 43, 72]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
