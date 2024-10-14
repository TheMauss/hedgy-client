import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface CancelOrdersArgs {
  marketType: types.MarketTypeKind | null;
  marketIndex: number | null;
  direction: types.PositionDirectionKind | null;
}

export interface CancelOrdersAccounts {
  state: PublicKey;
  user: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  borsh.option(types.MarketType.layout(), "marketType"),
  borsh.option(borsh.u16(), "marketIndex"),
  borsh.option(types.PositionDirection.layout(), "direction"),
]);

export function cancelOrders(
  args: CancelOrdersArgs,
  accounts: CancelOrdersAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([238, 225, 95, 158, 227, 103, 8, 194]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketType: (args.marketType && args.marketType.toEncodable()) || null,
      marketIndex: args.marketIndex,
      direction: (args.direction && args.direction.toEncodable()) || null,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
