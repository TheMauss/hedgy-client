import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface InitializeAffilAccArgs {
  affiliateCode: Array<number>;
}

export interface InitializeAffilAccAccounts {
  affilAcc: PublicKey;
  userAcc: PublicKey;
  playerAcc: PublicKey;
  systemProgram: PublicKey;
  clock: PublicKey;
}

export const layout = borsh.struct([
  borsh.array(borsh.u8(), 8, "affiliateCode"),
]);

export function initializeAffilAcc(
  args: InitializeAffilAccArgs,
  accounts: InitializeAffilAccAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.affilAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([91, 106, 206, 146, 91, 8, 149, 225]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      affiliateCode: args.affiliateCode,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
