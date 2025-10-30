import { spawn } from "child_process";

export default async ({ url, writable }) => {
  await new Promise((resolve, reject) => {
    if (!url) return reject("No URL provided");
    const ytdlp = spawn("yt-dlp", [
      "-f",
      "bestaudio[ext=m4a]/bestaudio",
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

    ffmpeg.on("close", (code, signal) => {
      console.log(`[ffmpeg] closed | code=${code}, signal=${signal}`);
      writable.end();
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });

    ytdlp.on("error", reject);
    ffmpeg.on("error", reject);
  });
};
