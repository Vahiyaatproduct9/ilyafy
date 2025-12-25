import { configDotenv } from "dotenv";
configDotenv({
  path: '../../.env',
  quiet: true
})
import { constants, publicEncrypt, privateDecrypt } from "crypto"
import { existsSync, readFileSync } from "fs"
function validFile(fileName: string) {
  const fileHere = `./${fileName}`;
  const fileRoot = `/${fileName}`;
  const fileSecrets = `/etc/secrets/${fileName}`
  const fileExistsRoot = existsSync(fileRoot);
  const fileExistsSecret = existsSync(fileSecrets);
  if (fileExistsRoot) return fileRoot;
  if (fileExistsSecret) return fileSecrets;
  return fileHere;
}
const publicKey = readFileSync(validFile('public.pem'), 'utf8');
const privateKey = readFileSync(validFile('private.pem'), 'utf8');
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