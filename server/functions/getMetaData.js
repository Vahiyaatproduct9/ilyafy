import { spawn } from "child_process";
import { copyFileSync, existsSync } from "fs";
import getValidProxy from "./getValidProxyv2.js";
export default async ({ url, proxy }) => {
  const localProxy = await getValidProxy();
  const srcPath = "/etc/secrets/cookies.txt";
  const tempPath = "./cookies.txt";
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, tempPath);
  }
  return new Promise((res, rej) => {
    const dlp = spawn("./yt-dlp", [
      "--proxy",
      proxy ?? localProxy,
      "-j",
      // "--cookies",
      // cookies,
      url,
    ]);
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
