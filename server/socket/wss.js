import { WebSocketServer } from "ws";
const wss = new WebSocketServer(
  {
    port: 443,
  },
  () => {
    console.log("WSS successfull!");
  }
);
export default wss;
