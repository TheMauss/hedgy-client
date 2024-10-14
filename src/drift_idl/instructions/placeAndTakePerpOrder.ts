import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PlaceAndTakePerpOrderArgs {
  params: types.OrderParamsFields;
  successCondition: number | null;
}

export interface PlaceAndTakePerpOrderAccounts {
  state: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  types.OrderParams.layout("params"),
  borsh.option(borsh.u32(), "successCondition"),
]);

export function placeAndTakePerpOrder(
  args: PlaceAndTakePerpOrderArgs,
  accounts: PlaceAndTakePerpOrderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([213, 51, 1, 187, 108, 220, 230, 224]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.OrderParams.toEncodable(args.params),
      successCondition: args.successCondition,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
