import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateVaultProtocolArgs {
  params: types.UpdateVaultProtocolParamsFields;
}

export interface UpdateVaultProtocolAccounts {
  vault: PublicKey;
  protocol: PublicKey;
  vaultProtocol: PublicKey;
}

export const layout = borsh.struct([
  types.UpdateVaultProtocolParams.layout("params"),
]);

export function updateVaultProtocol(
  args: UpdateVaultProtocolArgs,
  accounts: UpdateVaultProtocolAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.protocol, isSigner: true, isWritable: false },
    { pubkey: accounts.vaultProtocol, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([205, 248, 117, 191, 35, 252, 172, 133]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.UpdateVaultProtocolParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
