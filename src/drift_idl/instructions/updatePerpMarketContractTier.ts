import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePerpMarketContractTierArgs {
  contractTier: types.ContractTierKind;
}

export interface UpdatePerpMarketContractTierAccounts {
  admin: PublicKey;
  state: PublicKey;
  perpMarket: PublicKey;
}

export const layout = borsh.struct([types.ContractTier.layout("contractTier")]);

export function updatePerpMarketContractTier(
  args: UpdatePerpMarketContractTierArgs,
  accounts: UpdatePerpMarketContractTierAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([236, 128, 15, 95, 203, 214, 68, 117]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      contractTier: args.contractTier.toEncodable(),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
