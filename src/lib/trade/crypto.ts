import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * At-rest encryption for bank details (AES-256-GCM). Only these three columns
 * on `trades` go through this - nothing else in the app is encrypted.
 *
 * Key: BANK_DETAILS_ENCRYPTION_KEY, any non-empty string (a passphrase is fine;
 * it is stretched to a 256-bit key with scrypt, not used raw). Set it once in
 * .env.local / Vercel and never change it, or existing encrypted rows become
 * unreadable. Without it set, encryptBankField throws - trades are never
 * written with plaintext-by-accident.
 */

const SALT = "mobile-arcade-bank-details-v1"; // fixed: only derives the key, not a secret itself

function getKey() {
  const passphrase = process.env.BANK_DETAILS_ENCRYPTION_KEY;
  if (!passphrase) {
    throw new Error("BANK_DETAILS_ENCRYPTION_KEY is not configured.");
  }
  return scryptSync(passphrase, SALT, 32);
}

// "" in -> "" out, so an unfilled bank field never becomes a spurious ciphertext.
export function encryptBankField(value: string): string {
  if (!value) return "";
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decryptBankField(stored: string): string {
  if (!stored) return "";
  const key = getKey();
  const raw = Buffer.from(stored, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
