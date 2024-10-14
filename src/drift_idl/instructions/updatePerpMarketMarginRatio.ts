import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketMarginRatioArgs {
  marginRatioInitial: number;
  marginRatioMaintenance: number;
}

export interface UpdatePerpMarketMarginRatioAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u32("marginRatioInitial"),
  borsh.u32("marginRatioMaintenance"),
]);

export function updatePerpMarketMarginRatio(
  args: UpdatePerpMarketMarginRatioArgs,
  accounts: UpdatePerpMarketMarginRatioAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([130, 173, 107, 45, 119, 105, 26, 113]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marginRatioInitial: args.marginRatioInitial,
      marginRatioMaintenance: args.marginRatioMaintenance,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
