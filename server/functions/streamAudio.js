import { spawn } from "child_process";
export default async ({ url, writable }) => {
  await new Promise((resolve, reject) => {
    if (!url) reject("No URL provided. :(");
    const ytdlp = spawn("yt-dlp", ["-f", "bestaudio", "-o", "-", `${url}`]);
    ytdlp.stdout.pipe(writable);
    // ytdlp.stdout.on("data", (data) => {
    //   console.log("data: ", data);
    // });
    ytdlp.stderr.on("data", (data) => {
      const line = data.toString();
      if (line.includes("%")) process.stdout.write(`[yt-dlp] ${line}`);
    });
    ytdlp.on("error", (err) => reject(err));
    ytdlp.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`yt-dlp closed with Error code ${code}`));
    });
  });
};
