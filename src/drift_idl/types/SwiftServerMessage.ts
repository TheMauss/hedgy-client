import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "."; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";

export interface SwiftServerMessageFields {
  swiftOrderSignature: Array<number>;
  slot: BN;
}

export interface SwiftServerMessageJSON {
  swiftOrderSignature: Array<number>;
  slot: string;
}

export class SwiftServerMessage {
  readonly swiftOrderSignature: Array<number>;
  readonly slot: BN;

  constructor(fields: SwiftServerMessageFields) {
    this.swiftOrderSignature = fields.swiftOrderSignature;
    this.slot = fields.slot;
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.array(borsh.u8(), 64, "swiftOrderSignature"), borsh.u64("slot")],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new SwiftServerMessage({
      swiftOrderSignature: obj.swiftOrderSignature,
      slot: obj.slot,
    });
  }

  static toEncodable(fields: SwiftServerMessageFields) {
    return {
      swiftOrderSignature: fields.swiftOrderSignature,
      slot: fields.slot,
    };
  }

  toJSON(): SwiftServerMessageJSON {
    return {
      swiftOrderSignature: this.swiftOrderSignature,
      slot: this.slot.toString(),
    };
  }

  static fromJSON(obj: SwiftServerMessageJSON): SwiftServerMessage {
    return new SwiftServerMessage({
      swiftOrderSignature: obj.swiftOrderSignature,
      slot: new BN(obj.slot),
    });
  }

  toEncodable() {
    return SwiftServerMessage.toEncodable(this);
  }
}
