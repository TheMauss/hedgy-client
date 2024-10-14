import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface LiquidateSpotArgs {
  assetMarketIndex: number;
  liabilityMarketIndex: number;
  liquidatorMaxLiabilityTransfer: BN;
  limitPrice: BN | null;
}

export interface LiquidateSpotAccounts {
  state: PublicKey;
  authority: PublicKey;
  liquidator: PublicKey;
  liquidatorStats: PublicKey;
  user: PublicKey;
  userStats: PublicKey;
}

export const layout = borsh.struct([
  borsh.u16("assetMarketIndex"),
  borsh.u16("liabilityMarketIndex"),
  borsh.u128("liquidatorMaxLiabilityTransfer"),
  borsh.option(borsh.u64(), "limitPrice"),
]);

export function liquidateSpot(
  args: LiquidateSpotArgs,
  accounts: LiquidateSpotAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
    { pubkey: accounts.liquidator, isSigner: false, isWritable: true },
    { pubkey: accounts.liquidatorStats, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: false, isWritable: true },
    { pubkey: accounts.userStats, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([107, 0, 128, 41, 35, 229, 251, 18]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      assetMarketIndex: args.assetMarketIndex,
      liabilityMarketIndex: args.liabilityMarketIndex,
      liquidatorMaxLiabilityTransfer: args.liquidatorMaxLiabilityTransfer,
      limitPrice: args.limitPrice,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
