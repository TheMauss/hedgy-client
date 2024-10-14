import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface RequestWithdrawArgs {
  withdrawAmount: BN;
  withdrawUnit: types.WithdrawUnitKind;
}

export interface RequestWithdrawAccounts {
  vault: PublicKey;
  vaultDepositor: PublicKey;
  authority: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
  oracleAddress: PublicKey; // Add account 12
  spotMarketAddress: PublicKey; // Add account 13 (Drift Spot Market)
}

export const layout = borsh.struct([
  borsh.u64("withdrawAmount"),
  types.WithdrawUnit.layout("withdrawUnit"),
]);

export function requestWithdraw(
  args: RequestWithdrawArgs,
  accounts: RequestWithdrawAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultDepositor, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.driftUserStats, isSigner: false, isWritable: false },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: false },
    { pubkey: accounts.driftState, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleAddress, isSigner: false, isWritable: false }, // Add account 12
    { pubkey: accounts.spotMarketAddress, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([137, 95, 187, 96, 250, 138, 31, 182]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      withdrawAmount: args.withdrawAmount,
      withdrawUnit: args.withdrawUnit.toEncodable(),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
