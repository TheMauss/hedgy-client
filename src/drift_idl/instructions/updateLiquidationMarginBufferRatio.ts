import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateLiquidationMarginBufferRatioArgs {
  liquidationMarginBufferRatio: number;
}

export interface UpdateLiquidationMarginBufferRatioAccounts {
  admin: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([borsh.u32("liquidationMarginBufferRatio")]);

export function updateLiquidationMarginBufferRatio(
  args: UpdateLiquidationMarginBufferRatioArgs,
  accounts: UpdateLiquidationMarginBufferRatioAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([132, 224, 243, 160, 154, 82, 97, 215]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      liquidationMarginBufferRatio: args.liquidationMarginBufferRatio,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}