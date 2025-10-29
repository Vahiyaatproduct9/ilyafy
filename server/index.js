import express from "express";
import { configDotenv } from "dotenv";
import streamAudio from "./functions/streamAudio.js";
configDotenv({
  path: "./.env",
  quiet: true,
});
const app = express();
app.use(express.json());

app.get("/stream", (req, res) => {
  console.log("Running Stream");
  const { url } = req.query;
  if (!url)
    res.json({
      success: false,
      message: "Missing URL.",
    });
  res.setHeaders(
    new Headers({
      "Content-Type": "audio/mpeg",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    })
  );
  try {
    streamAudio({
      url,
      writable: res,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.json({
      success: false,
      message: "Couldn't Stream Audio",
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`---- LISTENING ON PORT: ${process.env.PORT} ----`);
});
