import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ManagerRequestWithdrawArgs {
  withdrawAmount: BN;
  withdrawUnit: types.WithdrawUnitKind;
}

export interface ManagerRequestWithdrawAccounts {
  vault: PublicKey;
  manager: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("withdrawAmount"),
  types.WithdrawUnit.layout("withdrawUnit"),
]);

export function managerRequestWithdraw(
  args: ManagerRequestWithdrawArgs,
  accounts: ManagerRequestWithdrawAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.manager, isSigner: true, isWritable: false },
    { pubkey: accounts.driftUserStats, isSigner: false, isWritable: false },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: false },
    { pubkey: accounts.driftState, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([10, 238, 194, 232, 76, 55, 68, 4]);
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
