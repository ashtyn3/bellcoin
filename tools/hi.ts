import { chain, transaction, Proof } from "./blockchain.ts";
import { createHash } from "https://deno.land/std@0.83.0/hash/mod.ts";

const blkChain = new chain();
for (let i = 0; i < 2000; i++) {
  const txn = new transaction(
    "0444ab205e405b221dc8a1f2ca3c63a677dc84bd544e93a9bf2a2763b881945bc68a894c2e6f1021877647581b1ccdda8a0e324ccc315e5053e367be1836619042",
    (Math.random() * 1000).toFixed().toString(),
    20
  );
  await txn.sign("00560485045000520170025041082770008320103100");
  await blkChain.addTxn(txn);
}

const miner = blkChain.minePending(
  "0444ab205e405b221dc8a1f2ca3c63a677dc84bd544e93a9bf2a2763b881945bc68a894c2e6f1021877647581b1ccdda8a0e324ccc315e5053e367be1836619042"
);
const hash = (data: string) => {
  const h = createHash("sha256");
  h.update(data);
  return h.toString();
};
console.log(miner);
while (true) {
  if (
    miner.hash.substring(0, miner.difficulty) ==
    new Array(miner.difficulty + 1).join("0")
  ) {
    miner.nonce++;
    miner.hash = miner.calcHash();
    break;
  }
}
