import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateInsuranceFundUnstakingPeriodArgs {
  insuranceFundUnstakingPeriod: BN;
}

export interface UpdateInsuranceFundUnstakingPeriodAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
}

export const layout = borsh.struct([borsh.i64("insuranceFundUnstakingPeriod")]);

export function updateInsuranceFundUnstakingPeriod(
  args: UpdateInsuranceFundUnstakingPeriodArgs,
  accounts: UpdateInsuranceFundUnstakingPeriodAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([44, 69, 43, 226, 204, 223, 202, 52]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      insuranceFundUnstakingPeriod: args.insuranceFundUnstakingPeriod,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
