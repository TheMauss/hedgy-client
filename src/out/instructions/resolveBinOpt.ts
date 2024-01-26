import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface ResolveBinOptArgs {
  finalPrice: BN;
}

export interface ResolveBinOptAccounts {
  binOpt: PublicKey;
  playerAcc: PublicKey;
  userAcc: PublicKey;
  ratioAcc: PublicKey;
  signerServer: PublicKey;
  houseAcc: PublicKey;
  pdaHouseAcc: PublicKey;
  lpAcc: PublicKey;
  clock: PublicKey;
  systemProgram: PublicKey;
}

export const layout = borsh.struct([borsh.i64("finalPrice")]);

export function resolveBinOpt(
  args: ResolveBinOptArgs,
  accounts: ResolveBinOptAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.binOpt, isSigner: false, isWritable: true },
    { pubkey: accounts.playerAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.userAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.ratioAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.signerServer, isSigner: true, isWritable: false },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: false },
    { pubkey: accounts.pdaHouseAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.lpAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([248, 123, 236, 161, 28, 63, 84, 107]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      finalPrice: args.finalPrice,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
