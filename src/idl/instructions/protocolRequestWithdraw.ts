import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ProtocolRequestWithdrawArgs {
  withdrawAmount: BN;
  withdrawUnit: types.WithdrawUnitKind;
}

export interface ProtocolRequestWithdrawAccounts {
  vault: PublicKey;
  vaultProtocol: PublicKey;
  protocol: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("withdrawAmount"),
  types.WithdrawUnit.layout("withdrawUnit"),
]);

export function protocolRequestWithdraw(
  args: ProtocolRequestWithdrawArgs,
  accounts: ProtocolRequestWithdrawAccounts,
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
  const identifier = Buffer.from([189, 46, 14, 31, 7, 254, 150, 132]);
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
