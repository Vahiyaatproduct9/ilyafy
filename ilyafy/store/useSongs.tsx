import { create } from 'zustand';
import { PlaylistProp } from '../types/songs';
import useMessage from './useMessage';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _delete from '../api/playlist/delete';
import post from '../api/playlist/post';
import useProfile from './useProfile';
import list from '../api/playlist/list';
type songList = {
  songs: PlaylistProp;
  add: typeof post;
  delete: typeof _delete;
  setSong: (arg: PlaylistProp) => void;
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
        }
        setMessage(response?.message || '');
        return response;
      },
      delete: async id => {
        const response = await _delete(id);
        if (response?.success) {
          set({
            songs: get().songs.filter(t => t.mediaId !== id || t.id !== id),
          });
        }
        setMessage(response?.message || '');
        return response;
      },
      setSong: arg => {
        set({ songs: arg });
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
