import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateProtocolIfSharesTransferConfigArgs {
  whitelistedSigners: Array<PublicKey> | null;
  maxTransferPerEpoch: BN | null;
}

export interface UpdateProtocolIfSharesTransferConfigAccounts {
  admin: PublicKey;
  protocolIfSharesTransferConfig: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([
  borsh.option(borsh.array(borsh.publicKey(), 4), "whitelistedSigners"),
  borsh.option(borsh.u128(), "maxTransferPerEpoch"),
]);

export function updateProtocolIfSharesTransferConfig(
  args: UpdateProtocolIfSharesTransferConfigArgs,
  accounts: UpdateProtocolIfSharesTransferConfigAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    {
      pubkey: accounts.protocolIfSharesTransferConfig,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([34, 135, 47, 91, 220, 24, 212, 53]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      whitelistedSigners: args.whitelistedSigners,
      maxTransferPerEpoch: args.maxTransferPerEpoch,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
