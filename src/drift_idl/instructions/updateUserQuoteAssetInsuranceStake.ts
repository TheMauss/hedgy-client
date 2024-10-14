import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateUserQuoteAssetInsuranceStakeAccounts {
  state: PublicKey;
  spotMarket: PublicKey;
  insuranceFundStake: PublicKey;
  userStats: PublicKey;
  signer: PublicKey;
  insuranceFundVault: PublicKey;
}

export function updateUserQuoteAssetInsuranceStake(
  accounts: UpdateUserQuoteAssetInsuranceStakeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.insuranceFundStake, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.signer, isSigner: true, isWritable: false },
    { pubkey: accounts.insuranceFundVault, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([251, 101, 156, 7, 2, 63, 30, 23]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
