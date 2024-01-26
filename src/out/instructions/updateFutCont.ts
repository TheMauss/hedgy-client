import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateFutContArgs {
  takeProfitPrice: BN;
  stopLossPrice: BN;
}

export interface UpdateFutContAccounts {
  futCont: PublicKey;
  playerAcc: PublicKey;
  oracleAccount: PublicKey;
}

export const layout = borsh.struct([
  borsh.i64("takeProfitPrice"),
  borsh.i64("stopLossPrice"),
]);

export function updateFutCont(
  args: UpdateFutContArgs,
  accounts: UpdateFutContAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.futCont, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.oracleAccount, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([131, 51, 101, 112, 17, 130, 149, 195]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      takeProfitPrice: args.takeProfitPrice,
      stopLossPrice: args.stopLossPrice,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
