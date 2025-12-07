import { create } from 'zustand';
import { PlaylistProp } from '../types/songs';
import useMessage from './useMessage';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _delete from '../api/playlist/delete';
import post from '../api/playlist/post';
import useProfile from './useProfile';
import list from '../api/playlist/list';
import TrackPlayer, { Track } from 'react-native-track-player';
type songList = {
  songs: Track[] | PlaylistProp;
  add: typeof post;
  addSong: (arg: Track) => Promise<void>;
  delete: typeof _delete;
  setSong: (arg: Track[] | PlaylistProp) => void;
  load: typeof list;
};
const setMessage = useMessage.getState().setMessage;
const accessToken = useProfile.getState().accessToken;
export default create(
  persist<songList>(
    (set, get) => ({
      songs: [],
      add: async url => {
        const response = await post(url);
        if (response?.success && response?.song) {
          set({ songs: [...get().songs, response.song] });
          await TrackPlayer.add({
            ...response.song,
            mediaId: response.song.id || response.song.mediaId,
          });
        }
        setMessage(response?.message || '');
        return response;
      },
      addSong: async song => {
        get().setSong([...get().songs, song]);
      },
      delete: async id => {
        const response = await _delete(id);
        if (response?.success) {
          set({
            songs: get().songs.filter(t => t.mediaId !== id || t.id !== id),
          });
          const queue = await TrackPlayer.getQueue();
          const index = queue.findIndex(t => t.mediaId === id);
          await TrackPlayer.remove(index);
        }
        setMessage(response?.message || '');
        return response;
      },
      setSong: async arg => {
        set({ songs: arg });
        await TrackPlayer.add(
          arg.map(i => {
            return { ...i, mediaId: i.id || i.mediaId };
          }),
        );
      },
      load: async token => {
        const at = token || accessToken || '';
        const response = await list(at);
        if (response?.success) {
          get().setSong(response?.songs || []);
        }
        setMessage(response?.message || '');
        return response;
      },
    }),
    {
      name: 'playlist',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
