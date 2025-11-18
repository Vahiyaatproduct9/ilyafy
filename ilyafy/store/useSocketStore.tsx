import { create } from 'zustand';
import { EventEmitter } from 'eventemitter3';
import { commands } from '../types/commandEmmiter';
import TrackPlayer from 'react-native-track-player';
import { io, Socket } from 'socket.io-client';
import path from '../path/path';
// import path from '../path/path';
interface wsConnectedion {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  sendMessage: (arg: Object | []) => boolean;
  user_id: string | null;
}
interface command {
  state: commands;
  data: any;
}
export const commandEmitter: EventEmitter<commands, string> =
  new EventEmitter();

export default create<wsConnectedion>()((set, get) => ({
  socket: null,
  user_id: null,
  isConnected: false,
  connect: () => {
    get().user_id = `${Date.now()}`;
    const socket: Socket = io(`http://${path}:8080`, {
      transports: ['websocket'],
    });
    // const ws = new WebSocket('wss://ilyafy.onrender.com');
    set({ socket: socket });
    // socket.connect();
    // socket.on('connect', () => {
    //   set({ isConnected: true });
    //   console.log('Socket Connected!');
    //   socket.emit('join', { user_id: get().user_id, room_id: '3' });
    // });
    // setInterval(async () => {
    //   const state = await TrackPlayer.getPlaybackState();
    //   const progress = await TrackPlayer.getProgress();
    //   const track_id = (await TrackPlayer.getActiveTrack())?.id;
    //   if (get().isConnected) {
    //     socket.emit('message', {
    //       state: 'heartbeat',
    //       status: state,
    //       progress,
    //       track_id,
    //       user_id: get().user_id,
    //       room_id: '3',
    //     });
    //   }
    // }, 7000);
    // socket.on('disconnect', () => {
    //   set({ isConnected: false, socket: null });
    //   console.log('Socket Disconnected!');
    // });
    // socket.on('error', err => {
    //   set({ isConnected: false });
    //   console.error('Socket Error: ', err);
    // });
    // socket.on('message', (message: command) => {
    //   console.log('Server SENT: ', message);
    //   commandEmitter.emit(message.state, message.data);
    // });
    // socket.on('connect_error', err => {
    //   set({ isConnected: false });
    //   console.error('Socket Connect Error: ', err);
    // });
  },
  sendMessage: arg => {
    console.log('sending Message: ', arg);
    if (get().isConnected && get().socket) {
      console.log('Connected, sending...');
      get().socket?.emit('message', {
        state: 'event',
        ...arg,
        user_id: get().user_id,
        room_id: '3',
      });
      return true;
    } else {
      return false;
    }
  },
}));
