import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface SettleRevenueToInsuranceFundArgs {
  spotMarketIndex: number;
}

export interface SettleRevenueToInsuranceFundAccounts {
  state: PublicKey;
  spotMarket: PublicKey;
  spotMarketVault: PublicKey;
  driftSigner: PublicKey;
  insuranceFundVault: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u16("spotMarketIndex")]);

export function settleRevenueToInsuranceFund(
  args: SettleRevenueToInsuranceFundArgs,
  accounts: SettleRevenueToInsuranceFundAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.spotMarketVault, isSigner: false, isWritable: true },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.insuranceFundVault, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([200, 120, 93, 136, 69, 38, 199, 159]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      spotMarketIndex: args.spotMarketIndex,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
