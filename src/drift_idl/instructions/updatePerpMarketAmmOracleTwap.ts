import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketAmmOracleTwapAccounts {
  state: PublicKey;
  perpMarket: PublicKey;
  oracle: PublicKey;
  admin: PublicKey;
}

export function updatePerpMarketAmmOracleTwap(
  accounts: UpdatePerpMarketAmmOracleTwapAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.oracle, isSigner: false, isWritable: false },
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([241, 74, 114, 123, 206, 153, 24, 202]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
