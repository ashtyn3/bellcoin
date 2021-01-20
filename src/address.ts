import {
  utils,
  getPublicKey,
  sign,
  verify,
} from "https://deno.land/x/secp256k1/mod.ts";
import { toHex } from "./utils";

export const generateSecret = (): string => {
  return toHex(utils.randomPrivateKey());
};

export const getAddress = (secret: string): string => {
  return getPublicKey(secret, true);
};
