import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePriceArgs {
  solPrice: BN;
  btcPrice: BN;
  bonkPrice: BN;
  pythPrice: BN;
  jupPrice: BN;
  ethPrice: BN;
  suiPrice: BN;
  tiaPrice: BN;
  timestamp: BN;
}

export interface UpdatePriceAccounts {
  ratioAcc: PublicKey;
  oracleSol: PublicKey;
  oracleBtc: PublicKey;
  oracleBonk: PublicKey;
  oraclePyth: PublicKey;
  oracleJup: PublicKey;
  oracleEth: PublicKey;
  oracleSui: PublicKey;
  oracleTia: PublicKey;
  houseAcc: PublicKey;
  signerServer: PublicKey;
}

export const layout = borsh.struct([
  borsh.i64("solPrice"),
  borsh.i64("btcPrice"),
  borsh.i64("bonkPrice"),
  borsh.i64("pythPrice"),
  borsh.i64("jupPrice"),
  borsh.i64("ethPrice"),
  borsh.i64("suiPrice"),
  borsh.i64("tiaPrice"),
  borsh.i64("timestamp"),
]);

export function updatePrice(
  args: UpdatePriceArgs,
  accounts: UpdatePriceAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.ratioAcc, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleSol, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleBtc, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleBonk, isSigner: false, isWritable: false },
    { pubkey: accounts.oraclePyth, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleJup, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleEth, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleSui, isSigner: false, isWritable: false },
    { pubkey: accounts.oracleTia, isSigner: false, isWritable: false },
    { pubkey: accounts.houseAcc, isSigner: false, isWritable: false },
    { pubkey: accounts.signerServer, isSigner: true, isWritable: false },
  ];
  const identifier = Buffer.from([61, 34, 117, 155, 75, 34, 123, 208]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      solPrice: args.solPrice,
      btcPrice: args.btcPrice,
      bonkPrice: args.bonkPrice,
      pythPrice: args.pythPrice,
      jupPrice: args.jupPrice,
      ethPrice: args.ethPrice,
      suiPrice: args.suiPrice,
      tiaPrice: args.tiaPrice,
      timestamp: args.timestamp,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
