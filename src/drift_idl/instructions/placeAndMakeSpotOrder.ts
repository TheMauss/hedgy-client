import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PlaceAndMakeSpotOrderArgs {
  params: types.OrderParamsFields;
  takerOrderId: number;
  fulfillmentType: types.SpotFulfillmentTypeKind | null;
}

export interface PlaceAndMakeSpotOrderAccounts {
  state: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
  taker: PublicKey;
  takerStats: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  types.OrderParams.layout("params"),
  borsh.u32("takerOrderId"),
  borsh.option(types.SpotFulfillmentType.layout(), "fulfillmentType"),
]);

export function placeAndMakeSpotOrder(
  args: PlaceAndMakeSpotOrderArgs,
  accounts: PlaceAndMakeSpotOrderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.taker, isSigner: false, isWritable: true },
    { pubkey: accounts.takerStats, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([149, 158, 85, 66, 239, 9, 243, 98]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.OrderParams.toEncodable(args.params),
      takerOrderId: args.takerOrderId,
      fulfillmentType:
        (args.fulfillmentType && args.fulfillmentType.toEncodable()) || null,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
