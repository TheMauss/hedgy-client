import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface ParticipantFields {
  pubkey: PublicKey;
  deposit: BN;
  lstDeposits: BN;
  pendingDeposit: BN;
  avgWeeklyDeposit: number;
  startOfWeeklyDeposit: number;
  avgMonthlyDeposit: number;
  startOfMonthlyDeposit: number;
}

export interface ParticipantJSON {
  pubkey: string;
  deposit: string;
  lstDeposits: string;
  pendingDeposit: string;
  avgWeeklyDeposit: number;
  startOfWeeklyDeposit: number;
  avgMonthlyDeposit: number;
  startOfMonthlyDeposit: number;
}

export class Participant {
  readonly pubkey: PublicKey;
  readonly deposit: BN;
  readonly lstDeposits: BN;
  readonly pendingDeposit: BN;
  readonly avgWeeklyDeposit: number;
  readonly startOfWeeklyDeposit: number;
  readonly avgMonthlyDeposit: number;
  readonly startOfMonthlyDeposit: number;

  constructor(fields: ParticipantFields) {
    this.pubkey = fields.pubkey;
    this.deposit = fields.deposit;
    this.lstDeposits = fields.lstDeposits;
    this.pendingDeposit = fields.pendingDeposit;
    this.avgWeeklyDeposit = fields.avgWeeklyDeposit;
    this.startOfWeeklyDeposit = fields.startOfWeeklyDeposit;
    this.avgMonthlyDeposit = fields.avgMonthlyDeposit;
    this.startOfMonthlyDeposit = fields.startOfMonthlyDeposit;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.publicKey("pubkey"),
        borsh.u64("deposit"),
        borsh.u64("lstDeposits"),
        borsh.u64("pendingDeposit"),
        borsh.u16("avgWeeklyDeposit"),
        borsh.u16("startOfWeeklyDeposit"),
        borsh.u16("avgMonthlyDeposit"),
        borsh.u16("startOfMonthlyDeposit"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Participant({
      pubkey: obj.pubkey,
      deposit: obj.deposit,
      lstDeposits: obj.lstDeposits,
      pendingDeposit: obj.pendingDeposit,
      avgWeeklyDeposit: obj.avgWeeklyDeposit,
      startOfWeeklyDeposit: obj.startOfWeeklyDeposit,
      avgMonthlyDeposit: obj.avgMonthlyDeposit,
      startOfMonthlyDeposit: obj.startOfMonthlyDeposit,
    });
  }

  static toEncodable(fields: ParticipantFields) {
    return {
      pubkey: fields.pubkey,
      deposit: fields.deposit,
      lstDeposits: fields.lstDeposits,
      pendingDeposit: fields.pendingDeposit,
      avgWeeklyDeposit: fields.avgWeeklyDeposit,
      startOfWeeklyDeposit: fields.startOfWeeklyDeposit,
      avgMonthlyDeposit: fields.avgMonthlyDeposit,
      startOfMonthlyDeposit: fields.startOfMonthlyDeposit,
    };
  }

  toJSON(): ParticipantJSON {
    return {
      pubkey: this.pubkey.toString(),
      deposit: this.deposit.toString(),
      lstDeposits: this.lstDeposits.toString(),
      pendingDeposit: this.pendingDeposit.toString(),
      avgWeeklyDeposit: this.avgWeeklyDeposit,
      startOfWeeklyDeposit: this.startOfWeeklyDeposit,
      avgMonthlyDeposit: this.avgMonthlyDeposit,
      startOfMonthlyDeposit: this.startOfMonthlyDeposit,
    };
  }

  static fromJSON(obj: ParticipantJSON): Participant {
    return new Participant({
      pubkey: new PublicKey(obj.pubkey),
      deposit: new BN(obj.deposit),
      lstDeposits: new BN(obj.lstDeposits),
      pendingDeposit: new BN(obj.pendingDeposit),
      avgWeeklyDeposit: obj.avgWeeklyDeposit,
      startOfWeeklyDeposit: obj.startOfWeeklyDeposit,
      avgMonthlyDeposit: obj.avgMonthlyDeposit,
      startOfMonthlyDeposit: obj.startOfMonthlyDeposit,
    });
  }

  toEncodable() {
    return Participant.toEncodable(this);
  }
}
