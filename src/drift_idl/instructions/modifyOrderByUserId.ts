import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ModifyOrderByUserIdArgs {
  userOrderId: number;
  modifyOrderParams: types.ModifyOrderParamsFields;
}

export interface ModifyOrderByUserIdAccounts {
  state: PublicKey;
  user: PublicKey;
  authority: PublicKey;
}

export const layout = borsh.struct([
  borsh.u8("userOrderId"),
  types.ModifyOrderParams.layout("modifyOrderParams"),
]);

export function modifyOrderByUserId(
  args: ModifyOrderByUserIdArgs,
  accounts: ModifyOrderByUserIdAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([158, 77, 4, 253, 252, 194, 161, 179]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      userOrderId: args.userOrderId,
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
