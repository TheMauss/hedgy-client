import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface DeleteInitializedPerpMarketArgs {
  marketIndex: number;
}

export interface DeleteInitializedPerpMarketAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([borsh.u16("marketIndex")]);

export function deleteInitializedPerpMarket(
  args: DeleteInitializedPerpMarketArgs,
  accounts: DeleteInitializedPerpMarketAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([91, 154, 24, 87, 106, 59, 190, 66]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketIndex: args.marketIndex,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
