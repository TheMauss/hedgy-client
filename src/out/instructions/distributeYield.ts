import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface DistributeYieldArgs {
  totalYield: BN;
}

export interface DistributeYieldAccounts {
  lotteryAccount: PublicKey;
}

export const layout = borsh.struct([borsh.u64("totalYield")]);

export function distributeYield(
  args: DistributeYieldArgs,
  accounts: DistributeYieldAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.lotteryAccount, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([233, 92, 186, 157, 235, 238, 212, 114]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      totalYield: args.totalYield,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
