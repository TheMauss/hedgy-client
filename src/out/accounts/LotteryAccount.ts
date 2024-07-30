import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface LotteryAccountFields {
  isInitialized: boolean;
  totalDeposits: BN;
  lstTotalDeposits: BN;
  participants: Array<types.ParticipantFields>;
}

export interface LotteryAccountJSON {
  isInitialized: boolean;
  totalDeposits: string;
  lstTotalDeposits: string;
  participants: Array<types.ParticipantJSON>;
}

export class LotteryAccount {
  readonly isInitialized: boolean;
  readonly totalDeposits: BN;
  readonly lstTotalDeposits: BN;
  readonly participants: Array<types.Participant>;

  static readonly discriminator = Buffer.from([
    1, 165, 125, 59, 215, 12, 246, 7,
  ]);

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.u64("totalDeposits"),
    borsh.u64("lstTotalDeposits"),
    borsh.vec(types.Participant.layout(), "participants"),
  ]);

  constructor(fields: LotteryAccountFields) {
    this.isInitialized = fields.isInitialized;
    this.totalDeposits = fields.totalDeposits;
    this.lstTotalDeposits = fields.lstTotalDeposits;
    this.participants = fields.participants.map(
      (item) => new types.Participant({ ...item })
    );
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<LotteryAccount | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(programId)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[],
    programId: PublicKey = PROGRAM_ID
  ): Promise<Array<LotteryAccount | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses);

    return infos.map((info) => {
      if (info === null) {
        return null;
      }
      if (!info.owner.equals(programId)) {
        throw new Error("account doesn't belong to this program");
      }

      return this.decode(info.data);
    });
  }

  static decode(data: Buffer): LotteryAccount {
    if (!data.slice(0, 8).equals(LotteryAccount.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = LotteryAccount.layout.decode(data.slice(8));

    return new LotteryAccount({
      isInitialized: dec.isInitialized,
      totalDeposits: dec.totalDeposits,
      lstTotalDeposits: dec.lstTotalDeposits,
      participants: dec.participants.map(
        (
          item: any /* eslint-disable-line @typescript-eslint/no-explicit-any */
        ) => types.Participant.fromDecoded(item)
      ),
    });
  }

  toJSON(): LotteryAccountJSON {
    return {
      isInitialized: this.isInitialized,
      totalDeposits: this.totalDeposits.toString(),
      lstTotalDeposits: this.lstTotalDeposits.toString(),
      participants: this.participants.map((item) => item.toJSON()),
    };
  }

  static fromJSON(obj: LotteryAccountJSON): LotteryAccount {
    return new LotteryAccount({
      isInitialized: obj.isInitialized,
      totalDeposits: new BN(obj.totalDeposits),
      lstTotalDeposits: new BN(obj.lstTotalDeposits),
      participants: obj.participants.map((item) =>
        types.Participant.fromJSON(item)
      ),
    });
  }
}
