import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface DepositIntoPerpMarketFeePoolArgs {
  amount: BN;
}

export interface DepositIntoPerpMarketFeePoolAccounts {
  state: PublicKey;
  perpMarket: PublicKey;
  admin: PublicKey;
  sourceVault: PublicKey;
  driftSigner: PublicKey;
  quoteSpotMarket: PublicKey;
  spotMarketVault: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([borsh.u64("amount")]);

export function depositIntoPerpMarketFeePool(
  args: DepositIntoPerpMarketFeePoolArgs,
  accounts: DepositIntoPerpMarketFeePoolAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: true },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.sourceVault, isSigner: false, isWritable: true },
    { pubkey: accounts.driftSigner, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteSpotMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.spotMarketVault, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([34, 58, 57, 68, 97, 80, 244, 6]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      amount: args.amount,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
