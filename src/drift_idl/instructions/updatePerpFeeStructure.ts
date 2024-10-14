import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpFeeStructureArgs {
  feeStructure: types.FeeStructureFields;
}

export interface UpdatePerpFeeStructureAccounts {
  admin: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([types.FeeStructure.layout("feeStructure")]);

export function updatePerpFeeStructure(
  args: UpdatePerpFeeStructureArgs,
  accounts: UpdatePerpFeeStructureAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([23, 178, 111, 203, 73, 22, 140, 75]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      feeStructure: types.FeeStructure.toEncodable(args.feeStructure),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
