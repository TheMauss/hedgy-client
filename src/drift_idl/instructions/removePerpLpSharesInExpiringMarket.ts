import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface RemovePerpLpSharesInExpiringMarketArgs {
  sharesToBurn: BN;
  marketIndex: number;
}

export interface RemovePerpLpSharesInExpiringMarketAccounts {
  state: PublicKey;
  user: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("sharesToBurn"),
  borsh.u16("marketIndex"),
]);

export function removePerpLpSharesInExpiringMarket(
  args: RemovePerpLpSharesInExpiringMarketArgs,
  accounts: RemovePerpLpSharesInExpiringMarketAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([83, 254, 253, 137, 59, 122, 68, 156]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      sharesToBurn: args.sharesToBurn,
      marketIndex: args.marketIndex,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
