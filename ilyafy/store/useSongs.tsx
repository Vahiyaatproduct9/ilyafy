import { create } from 'zustand';
import useMessage from './useMessage';
import RNFS from 'react-native-fs';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _delete from '../api/playlist/delete';
import post from '../api/playlist/post';
import useProfile from './useProfile';
import list from '../api/playlist/list';
import TrackPlayer from 'react-native-track-player';
import { CTrack } from '../types/songs';
// import useCurrentTrack from './useCurrentTrack';
type songList = {
  songs: CTrack[];
  add: typeof post;
  addSong: (arg: CTrack) => Promise<void>;
  delete: typeof _delete;
  setSong: (arg: CTrack[]) => void;
  load: typeof list;
  replace: (song: CTrack) => Promise<void>;
};
const setMessage = useMessage.getState().setMessage;
const accessToken = useProfile.getState().accessToken;
// const currentSong = useCurrentTrack.getState().track;
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
      replace: async song => {
        const queue = get().songs;
        const index = queue.findIndex(t => t.mediaId === song?.mediaId);
        queue[index] = song;
        get().setSong(queue);
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
        await TrackPlayer.reset();
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
          get().setSong(
            response?.songs?.map(song => {
              let localPath;
              const run = async () => {
                const filePath = `${RNFS.DownloadDirectoryPath}/${song?.mediaId}.aac`;
                const fileExists = await RNFS.exists(filePath);
                if (fileExists) localPath = filePath;
                else localPath = null;
              };
              run();
              return {
                url: localPath || song?.url || '',
                mediaId: song?.id || song?.mediaId || '',
                artist: song?.artist || 'Ilyafy',
                artwork: song?.thumbnail || undefined,
                title: song?.title || 'Unknown Song',
                localPath,
              };
            }) || [],
          );
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
