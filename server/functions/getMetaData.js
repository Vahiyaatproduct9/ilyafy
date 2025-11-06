import { spawn } from "child_process";
import getValidProxy from "./getValidProxyv2.js";
export default async ({ url, proxy }) => {
  const localProxy = await getValidProxy();
  return new Promise((res, rej) => {
    const dlp = spawn("yt-dlp", [
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
        console.log("data from getMetaData: ", data);
        res(JSON.parse(data || ""));
      } catch (err) {
        rej(err);
      }
    });
  });
};
