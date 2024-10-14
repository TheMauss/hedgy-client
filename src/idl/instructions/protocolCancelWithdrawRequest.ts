import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ProtocolCancelWithdrawRequestAccounts {
  vault: PublicKey;
  vaultProtocol: PublicKey;
  protocol: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
}

export function protocolCancelWithdrawRequest(
  accounts: ProtocolCancelWithdrawRequestAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultProtocol, isSigner: false, isWritable: true },
    { pubkey: accounts.protocol, isSigner: true, isWritable: false },
    { pubkey: accounts.driftUserStats, isSigner: false, isWritable: false },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: false },
    { pubkey: accounts.driftState, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([194, 217, 171, 94, 56, 253, 179, 242]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
