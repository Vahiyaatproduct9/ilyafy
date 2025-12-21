import { exec, spawn } from "child_process";
import { Response } from "express";
import { existsSync } from "fs";
import path from "path";
import { env } from "process";

export default async function ({ url, writable, proxy }: { url: string, writable: Response, proxy?: string }) {
  if (!url) return new Error("No URL provided");
  const dlpPath = path.resolve('./yt-dlp');
  console.log('dlp-path:', dlpPath);
  if (!existsSync(dlpPath)) {
    console.log("[setup] DLP not found at", dlpPath);
    await new Promise((res, rej) => {
      const dlpDnld = spawn("wget", [
        "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp"
      ]);
      dlpDnld.stdout.on('data', data => console.log("[dlpDnld] " + data.toString()));
      dlpDnld.stderr.on('data', data => console.error("[dldDnld] Error: " + data.toString()));
      dlpDnld.on('close', (code, signal) => {
        if (code === 0) {
          exec(`chmod +x ${dlpPath}`, (err) => {
            if (err) rej(err);
            else res(true);
          })
        } else {
          rej(new Error("yt-dlp download failed with code " + code + " and signal " + signal));
        }
      });
    });
  }
  const proxyCmd: string[] = ["--proxy", proxy || env.PROXY_SAMPLE || '', "-f", "bestaudio[ext = m4a] / bestaudio", "-o", "-", url];
  const ytdlp = spawn(dlpPath, proxy ? proxyCmd : [
    "-f",
    "bestaudio[ext=m4a]/bestaudio",
    "-o",
    "-",
    url,
  ]);

  const ffmpeg = spawn('ffmpeg', [
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
  ytdlp.stdout.pipe(ffmpeg.stdin);;
  ffmpeg.stdout.pipe(writable);
  ytdlp.stderr.on('data', d => console.error("[yt-dlp]", d.toString()));
  ffmpeg.stderr.on('data', d => console.error("[ffmpeg]", d.toString()));
  return await new Promise((res, rej) => {
    let errored = false;
    const fail = (err: string) => {
      if (errored) return;
      errored = true;
      console.log('Stream failed:', err);
      writable.end();
      rej(new Error(err));
    };
    ytdlp.on('error', fail);
    ffmpeg.on('error', fail);
    ffmpeg.on('close', (code, signal) => {
      if (code === 0) {
        console.log('Audio Sent!');
        writable.end();
        res(true);
      } else {
        fail(`[Error] ffmpeg closed with code ${code} and signal ${signal}`);
      }
      console.log('ffmpeg closed with code', code, 'and signal', signal);
    })
  })
}
