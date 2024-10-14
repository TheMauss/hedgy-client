import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface SettleMultiplePnlsArgs {
  marketIndexes: Array<number>;
  mode: types.SettlePnlModeKind;
}

export interface SettleMultiplePnlsAccounts {
  state: PublicKey;
  user: PublicKey;
  authority: PublicKey;
  spotMarketVault: PublicKey;
}

export const layout = borsh.struct([
  borsh.vec(borsh.u16(), "marketIndexes"),
  types.SettlePnlMode.layout("mode"),
]);

export function settleMultiplePnls(
  args: SettleMultiplePnlsArgs,
  accounts: SettleMultiplePnlsAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.spotMarketVault, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([127, 66, 117, 57, 40, 50, 152, 127]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      marketIndexes: args.marketIndexes,
      mode: args.mode.toEncodable(),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
