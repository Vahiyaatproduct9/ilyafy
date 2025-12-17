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
import useCurrentTrack from './useCurrentTrack';
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
const setMessage = useMessage.getState().setMessage;
const accessToken = useProfile.getState().accessToken;
// const currentSong = useCurrentTrack.getState().track;
export default create(
  persist<songList>(
    (set, get) => ({
      songs: [],
      isLoading: false,
      setLoading: arg => {
        set({ isLoading: arg });
      },
      add: async url => {
        const response = await post(url);
        if (response?.success && response?.song) {
          const song = response?.song;
          const track = {
            url: song?.url || '',
            title: song?.title || 'Unknown Song',
            artist: song?.artist || 'Ilyafy',
            artwork: song?.thumbnail || '',
            mediaId: song?.id || song?.mediaId || Date.now().toString(),
          };
          if (get().songs.find(t => t.mediaId === track.mediaId)) {
            setMessage('Song already exists in the playlist.');
          } else {
            set({ songs: [...get().songs, track] });
          }
          await TrackPlayer.add(track);
        }
        setMessage(response?.message || '');
        return response;
      },
      addSong: async song => {
        const songExists = get().songs.find(t => t.mediaId === song?.mediaId);
        if (songExists) {
          get().replace(song);
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
        queue[index] = song;
        await TrackPlayer.add(song).then(() => {
          set({ songs: [...queue] });
        });
      },
      delete: async id => {
        const response = await _delete(id);
        if (response?.success) {
          const newSongList = get().songs.filter(t => t.mediaId !== id);
          console.log('New Song List: ', newSongList);
          set({
            songs: newSongList,
          });
          console.log('new song list:', newSongList);
          const queue = await TrackPlayer.getQueue();
          // const currentTrack = useCurrentTrack.getState().track;
          const index = queue.findIndex(t => t.mediaId === id);
          // if (currentTrack?.mediaId === id) {
          //   await TrackPlayer.skipToNext();
          // }
          await TrackPlayer.remove(index);
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
        const songBatch: CTrack[] = [];
        const response = await list(at);
        if (response?.success) {
          get().setSong([]);
          for (const song of response?.songs || []) {
            let localPath;
            const filePath = `${RNFS.DocumentDirectoryPath}/${
              song?.mediaId || song?.id || ''
            }.aac`;
            const fileExists = await RNFS.exists(filePath);
            if (fileExists) {
              localPath = filePath;
              console.log('Stats: ', await RNFS.stat(filePath));
            } else {
              const fetchedSong = await stream.get(
                song?.ytUrl || '',
                song?.mediaId || song?.id,
              );
              console.log('FETCHEDSONG:', fetchedSong);
              const metadata = fetchedSong?.metadata;
              localPath =
                // headers?.filePath ||
                fetchedSong?.localPath || metadata?.url || undefined;
            }
            const newSong = {
              url: localPath || song?.url || '',
              mediaId: song?.id || song?.mediaId || '',
              artist: song?.artist || 'Ilyafy',
              artwork: song?.thumbnail || undefined,
              title: song?.title || 'Unknown Song',
              localPath,
            };
            songBatch.push(newSong);
            // get().setSong(songBatch);
            get().addSong(newSong);
            console.log('songs after adding:', get().songs);
          }
        }
        setMessage(response?.message || '');
        get().setLoading(false);
        return response;
      },
    }),
    {
      name: 'playlist',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
