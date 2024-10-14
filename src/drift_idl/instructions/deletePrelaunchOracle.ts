import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface DeletePrelaunchOracleArgs {
  perpMarketIndex: number;
}

export interface DeletePrelaunchOracleAccounts {
  admin: PublicKey;
  prelaunchOracle: PublicKey;
  perpMarket: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([borsh.u16("perpMarketIndex")]);

export function deletePrelaunchOracle(
  args: DeletePrelaunchOracleArgs,
  accounts: DeletePrelaunchOracleAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.prelaunchOracle, isSigner: false, isWritable: true },
    { pubkey: accounts.perpMarket, isSigner: false, isWritable: false },
    { pubkey: accounts.state, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([59, 169, 100, 49, 69, 17, 173, 253]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      perpMarketIndex: args.perpMarketIndex,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
