import mailto from "@libs/mailer"
import { configDotenv } from "dotenv"
import { writeFile } from "fs";
configDotenv({ quiet: true });
export default async function (filename: string, path: string) {
  await mailto({
    to: process.env.ADMIN_EMAIL,
    subject: 'Server Logs',
    attachments: [{
      filename,
      path,
    }],
  }).then(() => {
    writeFile(path, '', () => {
      console.log('resetted logs')
    })
    return {
      success: true,
      message: 'email sent!'
    }
  })
}