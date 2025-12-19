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
import stream from '../functions/stream/stream';
// import useCurrentTrack from './useCurrentTrack';
type songList = {
  songs: CTrack[];
  isLoading: boolean;
  setLoading: (arg: boolean) => void;
  add: typeof post;
  addSong: (arg: CTrack) => Promise<void>;
  delete: typeof _delete;
  removeSong: (id: string) => Promise<void>;
  setSong: (arg: CTrack[]) => void;
  load: typeof list;
  replace: (song: CTrack) => Promise<void>;
};
const setMessage = useMessage?.getState()?.setMessage;
const accessToken = useProfile?.getState()?.accessToken;
// const currentSong = useCurrentTrack?.getState()?.track;
const fetchedSong = async (url: string, id: string) => {
  const fetchedSong = await stream.get(url, id);
  if (!fetchedSong) {
    setMessage('Some Error Occured X(');
    return undefined;
  }
  const metadata = fetchedSong?.metadata;
  const headers = fetchedSong?.headers;
  const localPath = fetchedSong?.localPath || metadata?.url || undefined;
  const newSong = {
    url: localPath || '',
    mediaId: id,
    artist: headers['X-Track-Artist'] || metadata?.artist || 'Ilyafy',
    artwork: headers['X-Track-Thumb'] || metadata?.thumbnail || undefined,
    title: headers['X-Track-Title'] || metadata?.title || 'Unknown Song',
    localPath,
  };
  return newSong;
};
export default create(
  persist<songList>(
    (set, get) => ({
      songs: [],
      isLoading: false,
      setLoading: arg => {
        set({ isLoading: arg });
      },
      add: async url => {
        get().setLoading(true);
        return new Promise(async (resolve, reject) => {
          const response = await post(url);
          if (response?.success && response?.song) {
            resolve(response);
            const song = response?.song;
            const newSong = await fetchedSong(url, song?.id);
            if (!newSong) {
              reject('Song Not Found X(');
              setMessage('Song Not Found X(');
              return;
            }
            await TrackPlayer.add(newSong).then(() => {
              set({ songs: [...get().songs, newSong] });
            });
            get().setLoading(false);
            return;
          }
          reject(new Error('Fetch Failed'));
          setMessage('Network Error.');
          get().setLoading(false);
        });
      },
      addSong: async song => {
        const songExists = get().songs.find(t => t.mediaId === song?.mediaId);
        if (songExists) {
          if (song?.url.includes('http')) {
            const newSong = await fetchedSong(song?.url, song?.mediaId || '');
            if (!newSong) {
              setMessage("Couldn't fetch song X(");
              console.error('Error in useSongs.');
              return;
            }
            get().replace(newSong);
            return;
          }
          get().replace(song);
          return;
        }
        if (song?.url?.includes('http')) {
          const newSong = await fetchedSong(song?.url, song?.mediaId || '');
          if (!newSong) {
            setMessage("Couldn't fetch song X(");
            console.error('Error in useSongs.');
            return;
          }
          await TrackPlayer.add(newSong).then(() => {
            set({ songs: [...get().songs, newSong] });
          });
          return;
        }
        console.log('Adding song:', song);
        await TrackPlayer.add(song).then(() => {
          set({ songs: [...get().songs, song] });
        });
      },
      replace: async song => {
        const queue = get().songs;
        const index = queue.findIndex(t => t.mediaId === song?.mediaId);
        if (index === -1) {
          console.log('Song not found.');
          return;
        }
        await TrackPlayer.add(song, index).then(() => {
          set({ songs: [...queue] });
        });
      },
      delete: async id => {
        const response = await _delete(id);
        if (response?.success) {
          const newSongList = get().songs.filter(t => t.mediaId !== id);
          set({
            songs: newSongList,
          });
          const queue = await TrackPlayer.getQueue();
          const index = queue.findIndex(t => t.mediaId === id);
          await TrackPlayer.remove(index).then(() => {
            RNFS.unlink(`${RNFS.DocumentDirectoryPath}/${id}.acc`);
          });
        }
        setMessage(response?.message || '');
        return response;
      },
      removeSong: async id => {
        const newQueue = get().songs.filter(t => t.mediaId !== id);
        const queue = await TrackPlayer.getQueue();
        const index = queue.findIndex(t => t.mediaId === id);
        if (index === -1) {
          console.log('Already removed.');
          setMessage('Already deleted Song.');
          return;
        }
        TrackPlayer.remove(index).then(() => {
          set({ songs: newQueue });
        });
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
        get().setLoading(true);
        const at = token || accessToken || '';
        const response = await list(at);
        if (response?.success) {
          get().setSong([]);
          for (const song of response?.songs || []) {
            const filePath = `${RNFS.DocumentDirectoryPath}/${
              song?.mediaId || song?.id || ''
            }.aac`;
            const fileExists = await RNFS.exists(filePath);
            if (fileExists) {
              console.log('Stats: ', await RNFS.stat(filePath));
              get().addSong({
                url: filePath || '',
                mediaId: song?.mediaId || song?.id || '',
                title: song?.title || 'Unknown Song',
                artist: song?.artist || 'Ilyafy',
                artwork:
                  song?.thumbnail || require('../assets/images/background.png'),
              });
            } else {
              const newSong = await fetchedSong(song?.ytUrl, song?.id);
              if (!newSong) {
                return { success: false, message: "Couldn't Fetch Song." };
              }
              get().addSong(newSong);
              console.log('songs after adding:', get().songs);
            }
          }
          setMessage(response?.message || '');
          get().setLoading(false);
          return response;
        }
      },
    }),
    {
      name: 'playlist',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
