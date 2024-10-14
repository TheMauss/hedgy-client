import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface PlaceSwiftTakerOrderArgs {
  swiftMessageBytes: Uint8Array;
  swiftOrderParamsMessageBytes: Uint8Array;
  swiftMessageSignature: Array<number>;
}

export interface PlaceSwiftTakerOrderAccounts {
  state: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
  authority: PublicKey;
  /**
   * the supplied Sysvar could be anything else.
   * The Instruction Sysvar has not been implemented
   * in the Anchor framework yet, so this is the safe approach.
   */
  ixSysvar: PublicKey;
}

export const layout = borsh.struct([
  borsh.vecU8("swiftMessageBytes"),
  borsh.vecU8("swiftOrderParamsMessageBytes"),
  borsh.array(borsh.u8(), 64, "swiftMessageSignature"),
]);

export function placeSwiftTakerOrder(
  args: PlaceSwiftTakerOrderArgs,
  accounts: PlaceSwiftTakerOrderAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.ixSysvar, isSigner: false, isWritable: false },
  ];
  const identifier = Buffer.from([50, 89, 120, 78, 254, 15, 104, 140]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      swiftMessageBytes: Buffer.from(
        args.swiftMessageBytes.buffer,
        args.swiftMessageBytes.byteOffset,
        args.swiftMessageBytes.length
      ),
      swiftOrderParamsMessageBytes: Buffer.from(
        args.swiftOrderParamsMessageBytes.buffer,
        args.swiftOrderParamsMessageBytes.byteOffset,
        args.swiftOrderParamsMessageBytes.length
      ),
      swiftMessageSignature: args.swiftMessageSignature,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
