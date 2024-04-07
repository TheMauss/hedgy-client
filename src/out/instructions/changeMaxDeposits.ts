import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ChangeMaxDepositsArgs {
  maxSolDeposits: BN;
  maxUsdcDeposits: BN;
}

export interface ChangeMaxDepositsAccounts {
  lpAcc: PublicKey;
  houseAcc: PublicKey;
  signerWalletAccount: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("maxSolDeposits"),
  borsh.u64("maxUsdcDeposits"),
]);

export function changeMaxDeposits(
  args: ChangeMaxDepositsArgs,
  accounts: ChangeMaxDepositsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.houseAcc, isSigner: true, isWritable: true },
    {
      pubkey: accounts.signerWalletAccount,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([202, 137, 6, 90, 178, 225, 140, 22]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      maxSolDeposits: args.maxSolDeposits,
      maxUsdcDeposits: args.maxUsdcDeposits,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
