import { create } from 'zustand';
import { EventEmitter } from 'eventemitter3';
import { commands } from '../types/commandEmmiter';
import TrackPlayer from 'react-native-track-player';
import { io, Socket } from 'socket.io-client';
import { domain } from '../path/path';
import useProfile from './useProfile';
interface wsConnectedion {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  userId: string | null;
  sendMessage: (arg: Object | []) => boolean;
  roomId: string | null;
}
interface command {
  state: commands;
  data: any;
}
export const commandEmitter: EventEmitter<commands, string> =
  new EventEmitter();

export default create<wsConnectedion>()((set, get) => ({
  socket: null,
  userId: null,
  isConnected: false,
  roomId: null,
  connect: () => {
    const profile = useProfile.getState().profile;
    const roomId = profile?.room_part_of || Date.now().toString();
    const userId = profile?.id || Date.now().toString();
    const accessToken = useProfile.getState().accessToken;
    set({ userId, roomId });
    const socket: Socket = io(`${domain}`, {
      transports: ['websocket'],
    });
    // const ws = new WebSocket('wss://ilyafy.onrender.com');
    set({ socket: socket });
    socket.connect();
    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Socket Connected!');
      socket.emit('join', { accessToken, roomId });
    });
    setInterval(async () => {
      const state = await TrackPlayer.getPlaybackState();
      const progress = await TrackPlayer.getProgress();
      const track_id = (await TrackPlayer.getActiveTrack())?.id;
      if (get().isConnected) {
        socket.emit('message', {
          state: 'heartbeat',
          status: state,
          progress,
          track_id,
          userId: get().userId,
          roomId: get().roomId,
        });
      }
    }, 7000);
    socket.on('disconnect', () => {
      set({ isConnected: false, socket: null });
      console.log('Socket Disconnected!');
    });
    socket.on('error', err => {
      set({ isConnected: false });
      console.error('Socket Error: ', err);
    });
    socket.on('join', data => {
      console.log('Someone Joined: ', data);
    });
    socket.on('reject', data => {
      console.log('Rejected');
      commandEmitter.emit('reject', data);
      return data;
    });
    socket.on('message', (message: command) => {
      console.log('Server SENT: ', message);
      commandEmitter.emit(message.state, message.data);
    });
    socket.on('connect_error', err => {
      set({ isConnected: false });
      console.error('Socket Connect Error: ', err);
    });
  },
  sendMessage: arg => {
    console.log('sending Message: ', arg);
    if (get().isConnected && get().socket) {
      console.log('Connected, sending...');
      get().socket?.emit('message', {
        state: 'event',
        ...arg,
        userId: get().userId,
        roomId: get().roomId,
      });
      return true;
    } else {
      return false;
    }
  },
}));
