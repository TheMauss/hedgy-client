import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketIfFactorArgs {
  spotMarketIndex: number;
  userIfFactor: number;
  totalIfFactor: number;
}

export interface UpdateSpotMarketIfFactorAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("spotMarketIndex"),
  borsh.u32("userIfFactor"),
  borsh.u32("totalIfFactor"),
]);

export function updateSpotMarketIfFactor(
  args: UpdateSpotMarketIfFactorArgs,
  accounts: UpdateSpotMarketIfFactorAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([147, 30, 224, 34, 18, 230, 105, 4]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      spotMarketIndex: args.spotMarketIndex,
      userIfFactor: args.userIfFactor,
      totalIfFactor: args.totalIfFactor,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
