// generate-keys.ts
import { generateKeyPairSync } from "crypto";
import { writeFileSync } from "fs";

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 4096,          // 2048 minimum; 3072/4096 more secure
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    // cipher: "aes-256-cbc",    // optional passphrase encryption
    // passphrase: "your-passphrase"
  },
});

writeFileSync("private.pem", privateKey, { mode: 0o600 });
writeFileSync("public.pem", publicKey, { mode: 0o644 });

console.log("Saved private.pem and public.pem");
