import { create } from 'zustand';
import { EventEmitter } from 'eventemitter3';
import { commands } from '../types/commandEmmiter';
import TrackPlayer from 'react-native-track-player';
// import path from '../path/path';
interface wsConnectedion {
  ws: WebSocket | null;
  isConnected: boolean;
  connect: () => void;
  sendMessage: (arg: Object | []) => boolean;
}
interface command {
  state: commands;
  data: any;
}
export const commandEmitter: EventEmitter<commands, string> =
  new EventEmitter();

export default create<wsConnectedion>()((set, get) => ({
  ws: null,
  isConnected: false,
  connect: () => {
    if (get().ws) return;
    // const ws = new WebSocket('ws://localhost:8080');

    const ws = new WebSocket('wss://ilyafy.onrender.com');
    set({ ws });
    ws.onopen = () => {
      set({ isConnected: true });
      console.log('WebSocket Open!');
      ws.send(JSON.stringify({ state: 'join', user_id: '1', room_id: '3' }));
      setInterval(async () => {
        const state = await TrackPlayer.getPlaybackState();
        const progress = await TrackPlayer.getProgress();
        const track_id = (await TrackPlayer.getActiveTrack())?.id;
        ws.send(
          JSON.stringify({
            state: 'heartbeat',
            status: state.state,
            progress,
            track_id,
            user_id: '1',
            room_id: '3',
          }),
        );
      }, 7000);
    };
    ws.onmessage = msg => {
      const message: command = JSON.parse(msg.data);
      console.log('Server SENT: ', message);
      commandEmitter.emit(message.state, message.data);
    };
    ws.onclose = () => {
      set({ isConnected: false, ws: null });
      console.log('WebSocket Closed!');
      setTimeout(() => {
        console.warn('Server Disconnected! Retrying...');
        get().connect();
      }, 3000);
    };
    ws.onerror = err => {
      set({ isConnected: false });
      console.error('WebSocket Error: ', err);
    };
  },
  sendMessage: arg => {
    console.log('sending Message: ', arg);
    if (get().isConnected && get().ws) {
      get().ws?.send(JSON.stringify({ ...arg, user_id: '1', room_id: '3' }));
      return true;
    } else {
      return false;
    }
  },
}));
