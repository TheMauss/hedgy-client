import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketMaxSlippageRatioArgs {
  maxSlippageRatio: number;
}

export interface UpdatePerpMarketMaxSlippageRatioAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([borsh.u16("maxSlippageRatio")]);

export function updatePerpMarketMaxSlippageRatio(
  args: UpdatePerpMarketMaxSlippageRatioArgs,
  accounts: UpdatePerpMarketMaxSlippageRatioAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([235, 37, 40, 196, 70, 146, 54, 201]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      maxSlippageRatio: args.maxSlippageRatio,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
