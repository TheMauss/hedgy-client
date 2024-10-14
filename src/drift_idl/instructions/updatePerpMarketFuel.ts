import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketFuelArgs {
  fuelBoostTaker: number | null;
  fuelBoostMaker: number | null;
  fuelBoostPosition: number | null;
}

export interface UpdatePerpMarketFuelAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.option(borsh.u8(), "fuelBoostTaker"),
  borsh.option(borsh.u8(), "fuelBoostMaker"),
  borsh.option(borsh.u8(), "fuelBoostPosition"),
]);

export function updatePerpMarketFuel(
  args: UpdatePerpMarketFuelArgs,
  accounts: UpdatePerpMarketFuelAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([252, 141, 110, 101, 27, 99, 182, 21]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      fuelBoostTaker: args.fuelBoostTaker,
      fuelBoostMaker: args.fuelBoostMaker,
      fuelBoostPosition: args.fuelBoostPosition,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
