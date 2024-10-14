import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializeProtocolIfSharesTransferConfigAccounts {
  admin: PublicKey;
  protocolIfSharesTransferConfig: PublicKey;
  state: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
}

export function initializeProtocolIfSharesTransferConfig(
  accounts: InitializeProtocolIfSharesTransferConfigAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    {
      pubkey: accounts.protocolIfSharesTransferConfig,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([89, 131, 239, 200, 178, 141, 106, 194]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
