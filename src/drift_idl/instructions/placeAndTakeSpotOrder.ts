import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PlaceAndTakeSpotOrderArgs {
  params: types.OrderParamsFields;
  fulfillmentType: types.SpotFulfillmentTypeKind | null;
  makerOrderId: number | null;
}

export interface PlaceAndTakeSpotOrderAccounts {
  state: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  types.OrderParams.layout("params"),
  borsh.option(types.SpotFulfillmentType.layout(), "fulfillmentType"),
  borsh.option(borsh.u32(), "makerOrderId"),
]);

export function placeAndTakeSpotOrder(
  args: PlaceAndTakeSpotOrderArgs,
  accounts: PlaceAndTakeSpotOrderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([191, 3, 138, 71, 114, 198, 202, 100]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.OrderParams.toEncodable(args.params),
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
