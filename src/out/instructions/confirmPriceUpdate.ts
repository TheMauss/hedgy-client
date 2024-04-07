import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ConfirmPriceUpdateAccounts {
  ratioAcc: PublicKey;
  oracleSol: PublicKey;
  oracleBtc: PublicKey;
  oracleBonk: PublicKey;
  oraclePyth: PublicKey;
  oracleJup: PublicKey;
  oracleEth: PublicKey;
  oracleSui: PublicKey;
  oracleTia: PublicKey;
  houseAcc: PublicKey;
  secondSignerServer: PublicKey;
}

export function confirmPriceUpdate(
  accounts: ConfirmPriceUpdateAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.ratioAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleSol, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleBtc, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleBonk, isSigner: false, isWritable: false },
    { pubkey: accounts.oraclePyth, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleJup, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleEth, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleSui, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleTia, isSigner: false, isWritable: false },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: false },
    { pubkey: accounts.secondSignerServer, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([199, 8, 141, 168, 6, 108, 84, 178]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
