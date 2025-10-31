import { spawn } from "child_process";
import { copyFileSync, existsSync } from "fs";
export default async (url) => {
  const srcPath = "/etc/secrets/cookies.txt";
  const tempPath = "./cookies.txt";
  if (existsSync(srcPath)) {
    copyFileSync(tempPath);
  }
  const cookies = existsSync(tempPath) ? tempPath : "./cookies.txt";
  console.log(cookies);
  return new Promise((res, rej) => {
    const dlp = spawn("./yt-dlp", ["-j", "--cookies", cookies, url]);
    let data = "";
    dlp.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });
    dlp.stderr.on("data", (err) =>
      console.error("[yt-dlp] Error: ", err.toString())
    );
    dlp.on("close", (code, signal) => {
      console.log("MetaData closed with code " + code + "Signal: ", +signal);
      try {
        res(JSON.parse(data));
      } catch (err) {
        rej(err);
      }
    });
  });
};
