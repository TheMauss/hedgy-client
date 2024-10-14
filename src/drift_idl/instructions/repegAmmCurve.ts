import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface RepegAmmCurveArgs {
  newPegCandidate: BN;
}

export interface RepegAmmCurveAccounts {
  state: PublicKey;
  perpMarket: PublicKey;
  oracle: PublicKey;
  admin: PublicKey;
}

export const layout = borsh.struct([borsh.u128("newPegCandidate")]);

export function repegAmmCurve(
  args: RepegAmmCurveArgs,
  accounts: RepegAmmCurveAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.oracle, isSigner: false, isWritable: false },
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([3, 36, 102, 89, 180, 128, 120, 213]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      newPegCandidate: args.newPegCandidate,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
