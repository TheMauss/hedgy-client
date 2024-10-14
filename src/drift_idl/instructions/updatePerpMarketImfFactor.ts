import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketImfFactorArgs {
  imfFactor: number;
  unrealizedPnlImfFactor: number;
}

export interface UpdatePerpMarketImfFactorAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u32("imfFactor"),
  borsh.u32("unrealizedPnlImfFactor"),
]);

export function updatePerpMarketImfFactor(
  args: UpdatePerpMarketImfFactorArgs,
  accounts: UpdatePerpMarketImfFactorAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([207, 194, 56, 132, 35, 67, 71, 244]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      imfFactor: args.imfFactor,
      unrealizedPnlImfFactor: args.unrealizedPnlImfFactor,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
