import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ForceCancelOrdersAccounts {
  state: PublicKey;
  authority: PublicKey;
  filler: PublicKey;
  user: PublicKey;
}

export function forceCancelOrders(
  accounts: ForceCancelOrdersAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.filler, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([64, 181, 196, 63, 222, 72, 64, 232]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
