import { configDotenv } from "dotenv";
configDotenv({
  path: '../../.env',
  quiet: true
})
import { constants, publicEncrypt, privateDecrypt } from "crypto"
import { readFileSync } from "fs"
const publicKey = readFileSync('./public.pem', 'utf8');
const privateKey = readFileSync('./private.pem', 'utf8');
export function encrypt(text: string): string {
  const encrypt = publicEncrypt({
    key: publicKey,
    padding: constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
    passphrase: process.env.PASSWORD_ENCRYPTION_KEY || ''

  }, Buffer.from(text));
  return encrypt.toString("base64");
}
export function decrypt(encryptedText: string): string {
  const decrypted = privateDecrypt({
    key: privateKey,
    padding: constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
    passphrase: process.env.PASSWORD_ENCRYPTION_KEY || ''
  }, Buffer.from(encryptedText, "base64"));
  return decrypted.toString("utf8");
}