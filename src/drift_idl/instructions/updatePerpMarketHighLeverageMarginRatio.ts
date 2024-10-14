import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketHighLeverageMarginRatioArgs {
  marginRatioInitial: number;
  marginRatioMaintenance: number;
}

export interface UpdatePerpMarketHighLeverageMarginRatioAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("marginRatioInitial"),
  borsh.u16("marginRatioMaintenance"),
]);

export function updatePerpMarketHighLeverageMarginRatio(
  args: UpdatePerpMarketHighLeverageMarginRatioArgs,
  accounts: UpdatePerpMarketHighLeverageMarginRatioAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([88, 112, 86, 49, 24, 116, 74, 157]);
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
