import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketLiquidationFeeArgs {
  liquidatorFee: number;
  ifLiquidationFee: number;
}

export interface UpdatePerpMarketLiquidationFeeAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u32("liquidatorFee"),
  borsh.u32("ifLiquidationFee"),
]);

export function updatePerpMarketLiquidationFee(
  args: UpdatePerpMarketLiquidationFeeArgs,
  accounts: UpdatePerpMarketLiquidationFeeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([90, 137, 9, 145, 41, 8, 148, 117]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      liquidatorFee: args.liquidatorFee,
      ifLiquidationFee: args.ifLiquidationFee,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
