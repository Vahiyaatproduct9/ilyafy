import { spawn } from "child_process";
import { configDotenv } from "dotenv";
import PRXY from "./proxy";
configDotenv();
export default async function ({ url, proxy }: { url: string, proxy?: string }) {
  console.log('getMetaData', { url, proxy });
  return new Promise((res, rej) => {
    const dlp = spawn("yt-dlp", [
      '--force-ipv4',
      // "--proxy",
      // // proxy || PRXY() || process.env.PROXY_SAMPLE || '',
      // proxy || process.env.PROXY_SAMPLE || '',
      "-j",
      url
    ])
    let data = '';
    dlp.stdout.on('data', chunk => {
      data += chunk.toString();
    });
    dlp.stderr.on('data', chunk => {
      console.error('[yt-dlp]', chunk.toString());
      const timeout = 120_000;
      const timer = setTimeout(() => {
        dlp.kill("SIGKILL");
        rej(new Error(`yt-dlp process killed after ${timeout / 1000}s`));
      }, timeout);

      dlp.on('close', (code, signal) => {
        clearTimeout(timer);
        console.log("Metadata closed with code", code, "and signal", signal);
        if (code !== 0) {
          return rej(new Error("yt-dlp exited with Error Code " + code));
        }
        try {
          if (!data) {
            return rej(new Error("yt-dlp returned empty data"));
          }
          let json: object;
          try {
            json = JSON.parse(data.trim());
          } catch (err) {
            return rej(new Error(err));
          }
          return res(json);
        } catch (err) {
          return rej(new Error(err));
        }
      })
    })
  })
}