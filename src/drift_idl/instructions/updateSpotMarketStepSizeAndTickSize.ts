import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketStepSizeAndTickSizeArgs {
  stepSize: BN;
  tickSize: BN;
}

export interface UpdateSpotMarketStepSizeAndTickSizeAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("stepSize"),
  borsh.u64("tickSize"),
]);

export function updateSpotMarketStepSizeAndTickSize(
  args: UpdateSpotMarketStepSizeAndTickSizeArgs,
  accounts: UpdateSpotMarketStepSizeAndTickSizeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([238, 153, 137, 80, 206, 59, 250, 61]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      stepSize: args.stepSize,
      tickSize: args.tickSize,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}