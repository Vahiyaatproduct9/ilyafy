import { spawn } from "child_process";
export default async (url) => {
  return new Promise((res, rej) => {
    const dlp = spawn("./yt-dlp", [
      "-j",
      "--cookies",
      "/etc/secrets/cookies.txt",
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
