import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializeSerumFulfillmentConfigArgs {
  marketIndex: number;
}

export interface InitializeSerumFulfillmentConfigAccounts {
  baseSpotMarket: PublicKey;
  quoteSpotMarket: PublicKey;
  state: PublicKey;
  serumProgram: PublicKey;
  serumMarket: PublicKey;
  serumOpenOrders: PublicKey;
  driftSigner: PublicKey;
  serumFulfillmentConfig: PublicKey;
  admin: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u16("marketIndex")]);

export function initializeSerumFulfillmentConfig(
  args: InitializeSerumFulfillmentConfigArgs,
  accounts: InitializeSerumFulfillmentConfigAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.baseSpotMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteSpotMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
    { pubkey: accounts.serumProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.serumMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.serumOpenOrders, isSigner: false, isWritable: true },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    {
      pubkey: accounts.serumFulfillmentConfig,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([193, 211, 132, 172, 70, 171, 7, 94]);
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
