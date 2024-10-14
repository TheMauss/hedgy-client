import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface MoveAmmPriceArgs {
  baseAssetReserve: BN;
  quoteAssetReserve: BN;
  sqrtK: BN;
}

export interface MoveAmmPriceAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u128("baseAssetReserve"),
  borsh.u128("quoteAssetReserve"),
  borsh.u128("sqrtK"),
]);

export function moveAmmPrice(
  args: MoveAmmPriceArgs,
  accounts: MoveAmmPriceAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([235, 109, 2, 82, 219, 118, 6, 159]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      baseAssetReserve: args.baseAssetReserve,
      quoteAssetReserve: args.quoteAssetReserve,
      sqrtK: args.sqrtK,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
