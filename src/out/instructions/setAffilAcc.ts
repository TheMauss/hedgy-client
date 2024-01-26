import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface SetAffilAccArgs {
  usedAffiliate: Array<number>;
}

export interface SetAffilAccAccounts {
  userAcc: PublicKey;
  affilAcc: PublicKey;
  playerAcc: PublicKey;
  systemProgram: PublicKey;
  clock: PublicKey;
}

export const layout = borsh.struct([
  borsh.array(borsh.u8(), 8, "usedAffiliate"),
]);

export function setAffilAcc(
  args: SetAffilAccArgs,
  accounts: SetAffilAccAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.affilAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([50, 222, 214, 166, 235, 243, 190, 38]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      usedAffiliate: args.usedAffiliate,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
