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
  smallCommitSlot: BN;
  smallRandomnessAccount: PublicKey;
  bigLotteryTime: BN;
  bigLotteryHappened: boolean;
  smallLotteryTime: BN;
  smallLotteryHappened: boolean;
  bigCommitSlot: BN;
  bigRandomnessAccount: PublicKey;
  teamYield: BN;
  bigLotteryYield: BN;
  smallLotteryToBig: number;
  solIncentive: BN;
  lstIncentive: BN;
  bigSolIncentive: BN;
  bigLstIncentive: BN;
  bigLstLotteryYield: BN;
  teamLstYield: BN;
}

export interface LotteryAccountJSON {
  isInitialized: boolean;
  totalDeposits: string;
  lstTotalDeposits: string;
  participants: Array<types.ParticipantJSON>;
  smallCommitSlot: string;
  smallRandomnessAccount: string;
  bigLotteryTime: string;
  bigLotteryHappened: boolean;
  smallLotteryTime: string;
  smallLotteryHappened: boolean;
  bigCommitSlot: string;
  bigRandomnessAccount: string;
  teamYield: string;
  bigLotteryYield: string;
  smallLotteryToBig: number;
  solIncentive: string;
  lstIncentive: string;
  bigSolIncentive: string;
  bigLstIncentive: string;
  bigLstLotteryYield: string;
  teamLstYield: string;
}

export class LotteryAccount {
  readonly isInitialized: boolean;
  readonly totalDeposits: BN;
  readonly lstTotalDeposits: BN;
  readonly participants: Array<types.Participant>;
  readonly smallCommitSlot: BN;
  readonly smallRandomnessAccount: PublicKey;
  readonly bigLotteryTime: BN;
  readonly bigLotteryHappened: boolean;
  readonly smallLotteryTime: BN;
  readonly smallLotteryHappened: boolean;
  readonly bigCommitSlot: BN;
  readonly bigRandomnessAccount: PublicKey;
  readonly teamYield: BN;
  readonly bigLotteryYield: BN;
  readonly smallLotteryToBig: number;
  readonly solIncentive: BN;
  readonly lstIncentive: BN;
  readonly bigSolIncentive: BN;
  readonly bigLstIncentive: BN;
  readonly bigLstLotteryYield: BN;
  readonly teamLstYield: BN;

  static readonly discriminator = Buffer.from([
    1, 165, 125, 59, 215, 12, 246, 7,
  ]);

  static readonly layout = borsh.struct([
    borsh.bool("isInitialized"),
    borsh.u64("totalDeposits"),
    borsh.u64("lstTotalDeposits"),
    borsh.vec(types.Participant.layout(), "participants"),
    borsh.u64("smallCommitSlot"),
    borsh.publicKey("smallRandomnessAccount"),
    borsh.i64("bigLotteryTime"),
    borsh.bool("bigLotteryHappened"),
    borsh.i64("smallLotteryTime"),
    borsh.bool("smallLotteryHappened"),
    borsh.u64("bigCommitSlot"),
    borsh.publicKey("bigRandomnessAccount"),
    borsh.u64("teamYield"),
    borsh.u64("bigLotteryYield"),
    borsh.u8("smallLotteryToBig"),
    borsh.u64("solIncentive"),
    borsh.u64("lstIncentive"),
    borsh.u64("bigSolIncentive"),
    borsh.u64("bigLstIncentive"),
    borsh.u64("bigLstLotteryYield"),
    borsh.u64("teamLstYield"),
  ]);

  constructor(fields: LotteryAccountFields) {
    this.isInitialized = fields.isInitialized;
    this.totalDeposits = fields.totalDeposits;
    this.lstTotalDeposits = fields.lstTotalDeposits;
    this.participants = fields.participants.map(
      (item) => new types.Participant({ ...item })
    );
    this.smallCommitSlot = fields.smallCommitSlot;
    this.smallRandomnessAccount = fields.smallRandomnessAccount;
    this.bigLotteryTime = fields.bigLotteryTime;
    this.bigLotteryHappened = fields.bigLotteryHappened;
    this.smallLotteryTime = fields.smallLotteryTime;
    this.smallLotteryHappened = fields.smallLotteryHappened;
    this.bigCommitSlot = fields.bigCommitSlot;
    this.bigRandomnessAccount = fields.bigRandomnessAccount;
    this.teamYield = fields.teamYield;
    this.bigLotteryYield = fields.bigLotteryYield;
    this.smallLotteryToBig = fields.smallLotteryToBig;
    this.solIncentive = fields.solIncentive;
    this.lstIncentive = fields.lstIncentive;
    this.bigSolIncentive = fields.bigSolIncentive;
    this.bigLstIncentive = fields.bigLstIncentive;
    this.bigLstLotteryYield = fields.bigLstLotteryYield;
    this.teamLstYield = fields.teamLstYield;
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
      smallCommitSlot: dec.smallCommitSlot,
      smallRandomnessAccount: dec.smallRandomnessAccount,
      bigLotteryTime: dec.bigLotteryTime,
      bigLotteryHappened: dec.bigLotteryHappened,
      smallLotteryTime: dec.smallLotteryTime,
      smallLotteryHappened: dec.smallLotteryHappened,
      bigCommitSlot: dec.bigCommitSlot,
      bigRandomnessAccount: dec.bigRandomnessAccount,
      teamYield: dec.teamYield,
      bigLotteryYield: dec.bigLotteryYield,
      smallLotteryToBig: dec.smallLotteryToBig,
      solIncentive: dec.solIncentive,
      lstIncentive: dec.lstIncentive,
      bigSolIncentive: dec.bigSolIncentive,
      bigLstIncentive: dec.bigLstIncentive,
      bigLstLotteryYield: dec.bigLstLotteryYield,
      teamLstYield: dec.teamLstYield,
    });
  }

  toJSON(): LotteryAccountJSON {
    return {
      isInitialized: this.isInitialized,
      totalDeposits: this.totalDeposits.toString(),
      lstTotalDeposits: this.lstTotalDeposits.toString(),
      participants: this.participants.map((item) => item.toJSON()),
      smallCommitSlot: this.smallCommitSlot.toString(),
      smallRandomnessAccount: this.smallRandomnessAccount.toString(),
      bigLotteryTime: this.bigLotteryTime.toString(),
      bigLotteryHappened: this.bigLotteryHappened,
      smallLotteryTime: this.smallLotteryTime.toString(),
      smallLotteryHappened: this.smallLotteryHappened,
      bigCommitSlot: this.bigCommitSlot.toString(),
      bigRandomnessAccount: this.bigRandomnessAccount.toString(),
      teamYield: this.teamYield.toString(),
      bigLotteryYield: this.bigLotteryYield.toString(),
      smallLotteryToBig: this.smallLotteryToBig,
      solIncentive: this.solIncentive.toString(),
      lstIncentive: this.lstIncentive.toString(),
      bigSolIncentive: this.bigSolIncentive.toString(),
      bigLstIncentive: this.bigLstIncentive.toString(),
      bigLstLotteryYield: this.bigLstLotteryYield.toString(),
      teamLstYield: this.teamLstYield.toString(),
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
      smallCommitSlot: new BN(obj.smallCommitSlot),
      smallRandomnessAccount: new PublicKey(obj.smallRandomnessAccount),
      bigLotteryTime: new BN(obj.bigLotteryTime),
      bigLotteryHappened: obj.bigLotteryHappened,
      smallLotteryTime: new BN(obj.smallLotteryTime),
      smallLotteryHappened: obj.smallLotteryHappened,
      bigCommitSlot: new BN(obj.bigCommitSlot),
      bigRandomnessAccount: new PublicKey(obj.bigRandomnessAccount),
      teamYield: new BN(obj.teamYield),
      bigLotteryYield: new BN(obj.bigLotteryYield),
      smallLotteryToBig: obj.smallLotteryToBig,
      solIncentive: new BN(obj.solIncentive),
      lstIncentive: new BN(obj.lstIncentive),
      bigSolIncentive: new BN(obj.bigSolIncentive),
      bigLstIncentive: new BN(obj.bigLstIncentive),
      bigLstLotteryYield: new BN(obj.bigLstLotteryYield),
      teamLstYield: new BN(obj.teamLstYield),
    });
  }
}
