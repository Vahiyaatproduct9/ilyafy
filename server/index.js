import express from "express";
import http from "http";
import { configDotenv } from "dotenv";
import streamAudio from "./functions/streamAudio.js";
// import wss from "./socket/wss.js";
import { WebSocketServer } from "ws";
import getMetaData from "./functions/getMetaData.js";
import getValidProxy from "./functions/getValidProxyv2.js";
configDotenv({
  path: "./.env",
  quiet: true,
});
const app = express();
app.use(express.json());
const server = http.createServer(app);

app.get("/", (_, res) => {
  res.send("<h1>Hello</h1>");
});

app.get("/stream", async (req, res) => {
  console.log("Running Stream updated");
  const { url } = req.query;
  const proxy = await getValidProxy();

  if (!url)
    return res.json({
      success: false,
      message: "Missing URL.",
    });

  let file;
  try {
    file = await getMetaData({ url, proxy });
  } catch (err) {
    console.error("Metadata error:", err);
    return res.json({ success: false, message: "Failed to get metadata." });
  }

  const audioFormat = file.formats.find(
    (f) => f.ext === "m4a" || f.acodec === "aac"
  );
  console.log("audio:", audioFormat);

  // if we can directly stream from CDN
  if (audioFormat?.url) {
    return res.json({
      ...audioFormat,
      thumbnail: file?.thumbnail || "",
      artist: file?.artist || "",
      title: file?.title || "",
      duration: file?.duration || "",
      success: true,
    });
  }

  // otherwise stream manually
  const contentType = audioFormat?.mime_type || "audio/aac";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Transfer-Encoding", "chunked");
  if (req.headers.range) {
    res.status(206);
    res.setHeader("Accept-Ranges", "bytes");
  }
  if (audioFormat?.filesize)
    res.setHeader("Content-Length", audioFormat.filesize);

  res.setHeader("X-Track-Thumb", file?.thumbnail || "");
  res.setHeader("X-Track-Artist", file?.artist || file?.uploader || "");
  res.setHeader("X-Track-Title", file?.title || "");
  res.setHeader("X-Track-Duration", file?.duration || "");

  res.flushHeaders?.();

  try {
    await streamAudio({ url, writable: res, req, proxy });
  } catch (error) {
    console.error("Stream error:", error);
    res.json({ success: false, message: "Couldn't stream audio." });
  }
});

const wss = new WebSocketServer({ server });
wss.on("listening", () => console.log("ws started"));
const userMap = new Map();
const roomMap = new Map();
try {
  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ message: "Heyy from server!" }));
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      try {
        if (data.state === "join") {
          const { user_id, room_id } = data;
          userMap.set(user_id, ws);
          if (!roomMap.has(room_id)) roomMap.set(room_id, new Set());
          roomMap.get(room_id).add(user_id);
          ws.room_id = room_id;
          ws.user_id = user_id;
          console.log(`${user_id} connected to room ${room_id}`);
        } else {
          const { room_id, user_id: uid } = data;
          const users = roomMap.get(room_id);
          for (const user_id of users) {
            if (user_id === uid) {
              continue;
            }
            const socket = userMap.get(user_id);
            socket.send(JSON.stringify(data));
          }
        }
      } catch (error) {
        console.log("Err:", error);
      }
      ws.onclose = () => {
        if (!ws.user_id || !ws.room_id) return;
        console.log(`${ws.user_id} disconnected from ${ws.room_id}.`);
        userMap.delete(ws.user_id);
        const room = roomMap.get(ws.room_id);
        if (room) {
          room.delete(ws.user_id);
          if (room.size === 0) roomMap.delete(ws.room_id);
        }
      };
    };
  });
} catch (e) {
  console.log(e);
}
server.listen(process.env.PORT || 8080, () => {
  console.log(`---- LISTENING ON PORT: ${process.env.PORT} ----`);
});
