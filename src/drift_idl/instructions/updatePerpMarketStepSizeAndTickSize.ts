import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketStepSizeAndTickSizeArgs {
  stepSize: BN;
  tickSize: BN;
}

export interface UpdatePerpMarketStepSizeAndTickSizeAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.u64("stepSize"),
  borsh.u64("tickSize"),
]);

export function updatePerpMarketStepSizeAndTickSize(
  args: UpdatePerpMarketStepSizeAndTickSizeArgs,
  accounts: UpdatePerpMarketStepSizeAndTickSizeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([231, 255, 97, 25, 146, 139, 174, 4]);
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
