import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketFeeAdjustmentArgs {
  feeAdjustment: number;
}

export interface UpdatePerpMarketFeeAdjustmentAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([borsh.i16("feeAdjustment")]);

export function updatePerpMarketFeeAdjustment(
  args: UpdatePerpMarketFeeAdjustmentArgs,
  accounts: UpdatePerpMarketFeeAdjustmentAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([194, 174, 87, 102, 43, 148, 32, 112]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      feeAdjustment: args.feeAdjustment,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
