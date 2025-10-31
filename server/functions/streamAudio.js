import { exec, spawn } from "child_process";
import { existsSync } from "fs";
import path from "path";

export default async ({ url, writable }) => {
  if (!url) return reject("No URL provided");
  const dlpPath = path.resolve("./yt-dlp");
  console.log("dlpPath: ", dlpPath);
  if (!existsSync(dlpPath)) {
    console.log("[setup] DLP not found.. \n Downloading..");
    await new Promise((resolve, reject) => {
      const dlpDwnld = spawn("wget", [
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
      ]);
      dlpDwnld.stdout.on("data", (data) =>
        console.log("[dlpDwnld] " + data.toString())
      );
      dlpDwnld.stderr.on("data", (data) =>
        console.log("[dlpDwnld:err] " + data.toString())
      );
      dlpDwnld.on("close", (code, signal) => {
        if (code === 0) {
          exec(`chmod +x ${dlpPath}`, (err) => {
            if (err) reject(err);
            else resolve();
          });
        } else
          reject(
            new Error("Couldn't download. code " + code + " signal: " + signal)
          );
      });
    });
  }
  const ytdlp = spawn(dlpPath, [
    "-f",
    "bestaudio[ext=m4a]/bestaudio",
    "--cookies",
    "/etc/secrets/cookies.txt",
    "-o",
    "-",
    url,
  ]);

  const ffmpeg = spawn("ffmpeg", [
    "-v",
    "error",
    "-nostdin",
    "-i",
    "pipe:0",
    "-f",
    "adts",
    "-movflags",
    "+faststart",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ac",
    "2",
    "-ar",
    "44100",
    "pipe:1",
  ]);

  ytdlp.stdout.pipe(ffmpeg.stdin);
  ffmpeg.stdout.pipe(writable);

  ytdlp.stderr.on("data", (d) => console.log("[yt-dlp]", d.toString()));
  ffmpeg.stderr.on("data", (d) => console.log("[ffmpeg]", d.toString()));

  return await new Promise((resolve, reject) => {
    let errored = false;
    const fail = (err) => {
      if (errored) return;
      errored = true;
      console.log("[Stream Error] ", err);
      writable.end();
      reject(err);
    };
    ytdlp.on("error", fail);
    ffmpeg.on("error", fail);

    ffmpeg.on("close", (code, signal) => {
      if (code === 0) {
        console.log("Audio sent... :)");
        writable.end();
        resolve();
      } else {
        fail("[Error] ffmpeg exited with code " + code, " signal = ", signal);
      }
      console.log(`[ffmpeg] closed | code = ${code} | signal = ${signal}`);
    });
  });
};
