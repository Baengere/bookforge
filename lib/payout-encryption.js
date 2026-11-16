
import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";
const AAD = Buffer.from("bookforge:payout:v1");

function getEncryptionKey() {
  const secret = process.env.PAYOUT_ENCRYPTION_KEY;

  if (!secret || !/^[a-fA-F0-9]{64}$/.test(secret)) {
    throw new Error(
      "PAYOUT_ENCRYPTION_KEY must be a valid 32-byte hexadecimal key."
    );
  }

  return Buffer.from(secret, "hex");
}

export function encryptPayoutDestination(plaintext) {
  if (typeof plaintext !== "string" || !plaintext.trim()) {
    throw new Error("Payout destination must be a non-empty string.");
  }

  const iv = randomBytes(12);

  const cipher = createCipheriv(
    ALGORITHM,
    getEncryptionKey(),
    iv
  );

  cipher.setAAD(AAD);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    VERSION,
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptPayoutDestination(encryptedData) {
  if (typeof encryptedData !== "string") {
    throw new Error("Invalid encrypted payout data.");
  }

  const parts = encryptedData.split(":");

  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("Invalid encrypted payout data format.");
  }

  const [, ivHex, tagHex, ciphertextHex] = parts;

  if (
    !/^[a-fA-F0-9]{24}$/.test(ivHex) ||
    !/^[a-fA-F0-9]{32}$/.test(tagHex) ||
    !/^(?:[a-fA-F0-9]{2})+$/.test(ciphertextHex)
  ) {
    throw new Error("Invalid encrypted payout data.");
  }

  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      getEncryptionKey(),
      Buffer.from(ivHex, "hex")
    );

    decipher.setAAD(AAD);
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertextHex, "hex")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw new Error("Unable to decrypt payout destination.");
  }
}
