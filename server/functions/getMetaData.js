import { spawn } from "child_process";
import getValidProxy from "./getValidProxyv2.js";
import { configDotenv } from "dotenv";
configDotenv({
  quiet: true,
});
export default async ({ url, proxy }) => {
  const localProxy = await getValidProxy();
  console.log(`[getMetaData] using proxy: ${proxy ?? localProxy}`);
  return new Promise((res, rej) => {
    const dlp = spawn("yt-dlp", [
      "--force-ipv4",
      "--proxy",
      proxy ?? localProxy ?? process.env.PROXY_SAMPLE,
      "-vU",
      "-j",
      url,
    ]);
    let data = "";
    dlp.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });
    dlp.stderr.on("data", (err) =>
      console.error("[yt-dlp] Error: ", err.toString())
    );
    const timeout = 120_000;
    const timer = setTimeout(() => {
      dlp.kill("SIGKILL");
      rej(new Error("Connection Timed Out."));
    }, timeout);

    dlp.on("close", (code, signal) => {
      clearTimeout(timer);
      console.log("MetaData closed with code " + code + "Signal: ", +signal);
      if (code !== 0) {
        return rej(new Error("yt-dlp exited with code " + code));
      }
      try {
        if (!data) {
          return rej(new Error("yt-dlp returned no data"));
        }
        let json;
        try {
          json = JSON.parse(data.trim());
        } catch (err) {
          return rej(err);
        }
        return res(json);
      } catch (err) {
        rej(err);
      }
    });
  });
};
