import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializePhoenixFulfillmentConfigArgs {
  marketIndex: number;
}

export interface InitializePhoenixFulfillmentConfigAccounts {
  baseSpotMarket: PublicKey;
  quoteSpotMarket: PublicKey;
  state: PublicKey;
  phoenixProgram: PublicKey;
  phoenixMarket: PublicKey;
  driftSigner: PublicKey;
  phoenixFulfillmentConfig: PublicKey;
  admin: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u16("marketIndex")]);

export function initializePhoenixFulfillmentConfig(
  args: InitializePhoenixFulfillmentConfigArgs,
  accounts: InitializePhoenixFulfillmentConfigAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.baseSpotMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteSpotMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
    { pubkey: accounts.phoenixProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.phoenixMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    {
      pubkey: accounts.phoenixFulfillmentConfig,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([135, 132, 110, 107, 185, 160, 169, 154]);
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
