import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializeVaultWithProtocolArgs {
  params: types.VaultWithProtocolParamsFields;
}

export interface InitializeVaultWithProtocolAccounts {
  vault: PublicKey;
  vaultProtocol: PublicKey;
  tokenAccount: PublicKey;
  driftUserStats: PublicKey;
  driftUser: PublicKey;
  driftState: PublicKey;
  driftSpotMarket: PublicKey;
  driftSpotMarketMint: PublicKey;
  manager: PublicKey;
  payer: PublicKey;
  rent: PublicKey;
  systemProgram: PublicKey;
  driftProgram: PublicKey;
  tokenProgram: PublicKey;
}

export const layout = borsh.struct([
  types.VaultWithProtocolParams.layout("params"),
]);

export function initializeVaultWithProtocol(
  args: InitializeVaultWithProtocolArgs,
  accounts: InitializeVaultWithProtocolAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultProtocol, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.driftUserStats, isSigner: false, isWritable: true },
    { pubkey: accounts.driftUser, isSigner: false, isWritable: true },
    { pubkey: accounts.driftState, isSigner: false, isWritable: true },
    { pubkey: accounts.driftSpotMarket, isSigner: false, isWritable: false },
    {
      pubkey: accounts.driftSpotMarketMint,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.manager, isSigner: true, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.driftProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([176, 2, 248, 66, 116, 82, 52, 112]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      params: types.VaultWithProtocolParams.toEncodable(args.params),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
