import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateVaultArgs {
  params: types.UpdateVaultParamsFields;
}

export interface UpdateVaultAccounts {
  vault: PublicKey;
  manager: PublicKey;
}

export const layout = borsh.struct([types.UpdateVaultParams.layout("params")]);

export function updateVault(
  args: UpdateVaultArgs,
  accounts: UpdateVaultAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.manager, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([67, 229, 185, 188, 226, 11, 210, 60]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.UpdateVaultParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
