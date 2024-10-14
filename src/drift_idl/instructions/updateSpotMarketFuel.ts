import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateSpotMarketFuelArgs {
  fuelBoostDeposits: number | null;
  fuelBoostBorrows: number | null;
  fuelBoostTaker: number | null;
  fuelBoostMaker: number | null;
  fuelBoostInsurance: number | null;
}

export interface UpdateSpotMarketFuelAccounts {
  admin: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
}

export const layout = borsh.struct([
  borsh.option(borsh.u8(), "fuelBoostDeposits"),
  borsh.option(borsh.u8(), "fuelBoostBorrows"),
  borsh.option(borsh.u8(), "fuelBoostTaker"),
  borsh.option(borsh.u8(), "fuelBoostMaker"),
  borsh.option(borsh.u8(), "fuelBoostInsurance"),
]);

export function updateSpotMarketFuel(
  args: UpdateSpotMarketFuelArgs,
  accounts: UpdateSpotMarketFuelAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([226, 253, 76, 71, 17, 2, 171, 169]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      fuelBoostDeposits: args.fuelBoostDeposits,
      fuelBoostBorrows: args.fuelBoostBorrows,
      fuelBoostTaker: args.fuelBoostTaker,
      fuelBoostMaker: args.fuelBoostMaker,
      fuelBoostInsurance: args.fuelBoostInsurance,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
