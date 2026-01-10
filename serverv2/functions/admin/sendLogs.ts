import mailto from "@libs/mailer"
import { configDotenv } from "dotenv"
configDotenv();
import { readFile, writeFile } from "fs/promises";
export default async function (filename: string, path: string) {
  const fileContent = await readFile(path, { encoding: 'utf8' });
  await mailto({
    to: process.env.ADMIN_EMAIL,
    subject: 'Server Logs',
    html: `<p>Attached are the server logs: ${filename}</p>`,
    text: fileContent,
  }).then(() => {
    writeFile(path, '').then(
      () => {
        console.log('resetted logs')
      }
    )
    return {
      success: true,
      message: 'email sent!'
    }
  })
}