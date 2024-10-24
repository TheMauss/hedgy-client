import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketCumulativeInterestAccounts {
  state: PublicKey;
  spotMarket: PublicKey;
  oracle: PublicKey;
  spotMarketVault: PublicKey;
}

export function updateSpotMarketCumulativeInterest(
  accounts: UpdateSpotMarketCumulativeInterestAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.oracle, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarketVault, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([39, 166, 139, 243, 158, 165, 155, 225]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
