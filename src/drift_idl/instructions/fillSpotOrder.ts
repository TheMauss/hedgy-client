import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface FillSpotOrderArgs {
  orderId: number | null;
  fulfillmentType: types.SpotFulfillmentTypeKind | null;
  makerOrderId: number | null;
}

export interface FillSpotOrderAccounts {
  state: PublicKey;
  authority: PublicKey;
  filler: PublicKey;
  fillerStats: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
}

export const layout = borsh.struct([
  borsh.option(borsh.u32(), "orderId"),
  borsh.option(types.SpotFulfillmentType.layout(), "fulfillmentType"),
  borsh.option(borsh.u32(), "makerOrderId"),
]);

export function fillSpotOrder(
  args: FillSpotOrderArgs,
  accounts: FillSpotOrderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.filler, isSigner: false, isWritable: true },
    { pubkey: accounts.fillerStats, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([212, 206, 130, 173, 21, 34, 199, 40]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      orderId: args.orderId,
      fulfillmentType:
        (args.fulfillmentType && args.fulfillmentType.toEncodable()) || null,
      makerOrderId: args.makerOrderId,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
