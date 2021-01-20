import { toHex, fromHex } from "./utils.ts";
//import * as EC from "https://jspm.dev/elliptic";
import { createHash } from "https://deno.land/std@0.83.0/hash/mod.ts";
import * as secp from "https://deno.land/x/secp256k1/mod.ts";

export interface Txn {
  sig: string;
  hash: string;
  from: string;
  to: string;
  amount: number;
}

export interface Block {
  nonce: number;
  transactions: Txn[];
  hash: string;
  height: number;
  previousHash: string;
  timestamp: string;
}
export interface Proof {
  difficulty: number;
  sampleNumber: number;
  nonce: number;
  base: string;
}
export class transaction {
  to: string;
  from: string | null;
  amount: number;
  sig: Promise<string>;
  hash: string;
  constructor(from: string | null, to: string, amount: number) {
    this.to = to;
    this.from = from;
    this.amount = amount;
    this.sig = new Promise(() => "");
    this.hash = "";
  }
  calcHash() {
    const hash = createHash("sha256");
    hash.update(this.from + this.to + this.amount);
    return hash.toString();
  }
  sign(secret: string) {
    const pubKey = secp.getPublicKey(secret);
    if (pubKey != this.from) {
      throw new Error("Cannot sign transaction for other wallets.");
    }
    this.hash = this.calcHash();
    this.sig = secp.sign(this.calcHash(), secret).then((s) => {
      return s;
    });
  }
  async valid() {
    let SIG: string = await this.sig;
    if (this.from == null) return true;
    if (!SIG || SIG.length == 0) throw new Error("No signature.");
    const hash: string = this.calcHash();
    const isValid: boolean = secp.verify(
      fromHex(SIG),
      fromHex(hash),
      fromHex(this.from)
    );
    return isValid;
  }
}
export class block {
  previousHash: string;
  timestamp: number;
  transactions: transaction[];
  nonce: number;
  hash: string;
  difficulty: number;
  constructor(
    timestamp: number = Date.now(),
    previousHash: string = "",
    transactions: transaction[]
  ) {
    this.timestamp = timestamp;
    this.previousHash = "";
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = this.calcHash();
    this.difficulty = 1;
  }

  calcHash(): string {
    const hash = createHash("sha256");
    hash.update(
      this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    );
    return hash.toString();
  }
  validateProof(proof: Proof): boolean {
    const hash = (data: number) => {
      const h = createHash("sha256");
      h.update(data.toString());
      return h.toString();
    };
    const baseHash: string = hash(proof.difficulty);
    if (baseHash.length != proof.sampleNumber) {
      throw new Error("Difficulty hash doesn't match original length.");
    }
    if (
      proof.base.substring(0, baseHash.length - 1) ==
        new Array(proof.sampleNumber).join("0") &&
      proof.nonce > 5
    ) {
      return true;
    }
    return false;
  }
  async valid() {
    for (const txn of this.transactions) {
      if (!(await txn.valid())) return false;
    }
    return true;
  }
}
const diff_hours = (dt2: Date, dt1: Date) => {
  let diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60 * 60;
  return Math.abs(Math.round(diff));
};

export class chain {
  chain: block[];
  pending: transaction[];
  difficulty: number;
  count: number;
  constructor() {
    this.chain = [this.createGenBlock()];
    this.pending = [];
    this.difficulty = 0;
    this.count = 0;
  }
  createGenBlock() {
    return new block(0, "0/0/00", []);
  }
  getLatest() {
    return this.chain[this.chain.length - 1];
  }
  minePending(to: string) {
    const reward: transaction = new transaction(
      null,
      to,
      5 + this.pending.length
    );
    const tree: transaction[] = this.pending.slice(0, 5);
    const newBlock: block = new block(Date.now(), this.getLatest().hash, tree);
    this.count += 1;
    if (this.count == 2000) {
      const elapsedTime = diff_hours(
        new Date(),
        new Date(this.chain[this.chain.length - 2001].timestamp)
      );
      if (elapsedTime / 2000 / 60 == 5.76) {
        this.count = 0;
      } else {
        this.difficulty = this.difficulty * (8 / elapsedTime);
      }
    } else {
      this.difficulty = 1;
    }

    newBlock.difficulty = this.difficulty;
    return newBlock;
  }
  async addTxn(txn: transaction) {
    if (!this.valid()) throw new Error("Chain has been haulted.");
    if (!txn.from || !txn.to) throw new Error("Unknown to or from address.");
    if (!(await txn.valid()))
      throw new Error("cannot add stale transaction to chain.");
    this.pending.push(txn);
  }
  async valid() {
    for (let i: number = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const preBlock = this.chain[i - 1];
      if (!(await currentBlock.valid())) return false;
      if (currentBlock.hash !== currentBlock.calcHash()) return false;
      if (currentBlock.previousHash !== preBlock.hash) return false;
    }
    return true;
  }
}
