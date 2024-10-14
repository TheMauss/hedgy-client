import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface TransferProtocolIfSharesArgs {
  marketIndex: number;
  shares: BN;
}

export interface TransferProtocolIfSharesAccounts {
  signer: PublicKey;
  transferConfig: PublicKey;
  state: PublicKey;
  spotMarket: PublicKey;
  insuranceFundStake: PublicKey;
  userStats: PublicKey;
  authority: PublicKey;
  insuranceFundVault: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("marketIndex"),
  borsh.u128("shares"),
]);

export function transferProtocolIfShares(
  args: TransferProtocolIfSharesArgs,
  accounts: TransferProtocolIfSharesAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.signer, isSigner: true, isWritable: false },
    { pubkey: accounts.transferConfig, isSigner: false, isWritable: true },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.spotMarket, isSigner: false, isWritable: true },
    { pubkey: accounts.insuranceFundStake, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.insuranceFundVault, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([94, 93, 226, 240, 195, 201, 184, 109]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketIndex: args.marketIndex,
      shares: args.shares,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
