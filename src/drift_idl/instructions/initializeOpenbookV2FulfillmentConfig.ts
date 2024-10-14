import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializeOpenbookV2FulfillmentConfigArgs {
  marketIndex: number;
}

export interface InitializeOpenbookV2FulfillmentConfigAccounts {
  baseSpotMarket: PublicKey;
  quoteSpotMarket: PublicKey;
  state: PublicKey;
  openbookV2Program: PublicKey;
  openbookV2Market: PublicKey;
  driftSigner: PublicKey;
  openbookV2FulfillmentConfig: PublicKey;
  admin: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u16("marketIndex")]);

export function initializeOpenbookV2FulfillmentConfig(
  args: InitializeOpenbookV2FulfillmentConfigArgs,
  accounts: InitializeOpenbookV2FulfillmentConfigAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.baseSpotMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteSpotMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
    { pubkey: accounts.openbookV2Program, isSigner: false, isWritable: false },
    { pubkey: accounts.openbookV2Market, isSigner: false, isWritable: false },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    {
      pubkey: accounts.openbookV2FulfillmentConfig,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([7, 221, 103, 153, 107, 57, 27, 197]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketIndex: args.marketIndex,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
