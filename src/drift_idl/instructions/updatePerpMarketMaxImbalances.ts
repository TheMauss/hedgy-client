import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketMaxImbalancesArgs {
  unrealizedMaxImbalance: BN;
  maxRevenueWithdrawPerPeriod: BN;
  quoteMaxInsurance: BN;
}

export interface UpdatePerpMarketMaxImbalancesAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("unrealizedMaxImbalance"),
  borsh.u64("maxRevenueWithdrawPerPeriod"),
  borsh.u64("quoteMaxInsurance"),
]);

export function updatePerpMarketMaxImbalances(
  args: UpdatePerpMarketMaxImbalancesArgs,
  accounts: UpdatePerpMarketMaxImbalancesAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([15, 206, 73, 133, 60, 8, 86, 89]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      unrealizedMaxImbalance: args.unrealizedMaxImbalance,
      maxRevenueWithdrawPerPeriod: args.maxRevenueWithdrawPerPeriod,
      quoteMaxInsurance: args.quoteMaxInsurance,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
