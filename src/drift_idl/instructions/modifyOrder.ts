import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ModifyOrderArgs {
  orderId: number | null;
  modifyOrderParams: types.ModifyOrderParamsFields;
}

export interface ModifyOrderAccounts {
  state: PublicKey;
  user: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  borsh.option(borsh.u32(), "orderId"),
  types.ModifyOrderParams.layout("modifyOrderParams"),
]);

export function modifyOrder(
  args: ModifyOrderArgs,
  accounts: ModifyOrderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([47, 124, 117, 255, 201, 197, 130, 94]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      orderId: args.orderId,
      modifyOrderParams: types.ModifyOrderParams.toEncodable(
        args.modifyOrderParams
      ),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
