import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketStatusArgs {
  status: types.MarketStatusKind;
}

export interface UpdatePerpMarketStatusAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([types.MarketStatus.layout("status")]);

export function updatePerpMarketStatus(
  args: UpdatePerpMarketStatusArgs,
  accounts: UpdatePerpMarketStatusAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([71, 201, 175, 122, 255, 207, 196, 207]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      status: args.status.toEncodable(),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
