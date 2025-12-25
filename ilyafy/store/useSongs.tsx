import { create } from 'zustand';
import useMessage from './useMessage';
import RNFS from 'react-native-fs';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _delete from '../api/playlist/delete';
import post from '../api/playlist/post';
import list from '../api/playlist/list';
import TrackPlayer from 'react-native-track-player';
import { AudioStream, CTrack, songProp } from '../types/songs';
import getSongDetail from '../api/playlist/get';
import stream from '../functions/stream/stream';
import NewPipeModule from '../modules/NewPipeModule';
// import useCurrentTrack from './useCurrentTrack';
const thumbnail = require('../assets/images/background.png');
type songList = {
  songs: songProp[];
  isLoading: boolean;
  setLoading: (arg: boolean) => void;
  add: typeof post;
  addSong: (arg: CTrack) => Promise<void>;
  delete: typeof _delete;
  removeSong: (id: string) => Promise<void>;
  setSong: (arg: songProp[]) => void;
  load: typeof list;
  replace: (song: CTrack) => Promise<void>;
  songQuality: Map<string, AudioStream[]>;
};
const setMessage = useMessage?.getState()?.setMessage;
const fetchedSong = async (url: string, id: string, song?: CTrack) => {
  const fs = await stream.localGet(url, id);
  let metadata = fs?.metadata;
  let localPath = fs?.localPath || metadata?.url || undefined;
  const newSong = {
    url: localPath || metadata?.url || '',
    mediaId: id || song?.id || song?.mediaId,
    artist: song?.artist || metadata?.artist || 'Ilyafy',
    artwork: song?.artwork || metadata?.thumbnail || undefined,
    title: song?.title || metadata?.title || 'Unknown Song',
    localPath,
  };
  console.log('new Song:::', newSong);

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
      songQuality: new Map<string, AudioStream[]>(),
      add: async url => {
        get().setLoading(true);
        return new Promise(async (resolve, reject) => {
          const response = await post(url);
          if (response?.success && response?.song) {
            resolve(response);
            const song = response?.song;
            const newSong = await fetchedSong(url, song?.id);
            console.log('adding new song:', newSong);
            if (!newSong) {
              reject('Song Not Found X(');
              setMessage('Song Not Found X(');
              return;
            }
            await TrackPlayer.add(newSong).then(() => {
              set({
                songs: response?.song
                  ? [...get().songs, response?.song]
                  : [...get().songs],
              });
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
        const songExists = get().songs.find(t => t.id === song?.mediaId);
        if (songExists) {
          if (song?.url.includes('http')) {
            const songDetails = await getSongDetail(song?.mediaId || '');
            if (!songDetails?.success) {
              console.error("Song doesn't exist in playlist.");
              setMessage('Song does not exist.');
              return;
            }
            const newSong = await fetchedSong(
              songDetails?.song?.ytUrl || '',
              song?.mediaId || '',
            );
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
        const songDetails = await getSongDetail(song?.mediaId || '');
        if (song?.url?.includes('http')) {
          if (!songDetails?.success) {
            console.error("Song doesn't exist in playlist.");
            setMessage('Song does not exist.');
            return;
          }
          const newSong = await fetchedSong(
            songDetails?.song?.ytUrl || '',
            song?.mediaId || '',
          );
          if (!newSong) {
            setMessage("Couldn't fetch song X(");
            console.error('Error in useSongs.');
            return;
          }
          const fetchedSongInfo = songDetails?.song;
          await TrackPlayer.add(newSong).then(() => {
            fetchedSongInfo &&
              set({ songs: [...get().songs, fetchedSongInfo] });
          });
          return;
        }
        console.log('Adding song:', song);
        await TrackPlayer.add(song).then(() => {
          songDetails?.song &&
            set({ songs: [...get().songs, songDetails?.song] });
        });
      },
      replace: async song => {
        let queue = get().songs;
        const index = queue.findIndex(t => t.id === song?.mediaId);
        if (index === -1) {
          console.log('Song not found.');
          return;
        }
        const songInfo = queue[index];
        queue[index] = {
          ...songInfo,
          url: song?.url,
          title: song?.title || songInfo?.title || 'Unknown Song',
          artist: song?.artist || songInfo?.artist || 'Ilyafy',
          thumbnail: song?.artwork || songInfo?.thumbnail,
        };
        await TrackPlayer.remove(index).then(async () => {
          await TrackPlayer.add(song, index);
          set({ songs: [...queue] });
        });
        console.log('trackplayer queue:', await TrackPlayer.getQueue());
      },
      delete: async id => {
        const response = await _delete(id);
        if (response?.success) {
          const newSongList = get().songs.filter(t => t.id !== id);
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
        const newQueue = get().songs.filter(t => t.id !== id);
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
            return {
              ...i,
              mediaId: i.id,
            };
          }),
        );
      },
      load: async token => {
        get().setLoading(true);
        const songs = await list(token || '');
        if (!songs?.success) {
          setMessage('Network Err X(');
          return;
        }
        await TrackPlayer.reset().then(() => get().setSong([]));
        for (const song of songs?.songs || []) {
          const filePath = `${RNFS.CachesDirectoryPath}/${song?.id || ''}.aac`;
          const fileExists = await RNFS.exists(filePath);
          if (fileExists) {
            console.log('file stats:', await RNFS.stat(filePath));
            const songObject: CTrack = {
              url: filePath || '',
              mediaId: song?.id || '',
              title: song?.title || 'Unknown Song',
              artist: song?.artist || 'Ilyafy',
              artwork: song?.thumbnail || thumbnail,
            };
            get().addSong(songObject);
          } else {
            const songDetails = await NewPipeModule.extractStream(song?.ytUrl);
            console.log('song details:', songDetails);
            const bitrateMap = new Map<number, string>();
            songDetails?.audioStreams.map(t => {
              bitrateMap.set(t.bitrate, t.url);
            });
            const lowestBitrateUrl = bitrateMap.get(
              Math.min(...bitrateMap.keys()),
            );
            const remoteSongObject: CTrack = {
              url: lowestBitrateUrl || '',
              title: songDetails?.title || 'Unknown Song',
              artist: songDetails?.uploader || 'Ilyafy',
              mediaId: song?.id,
              artwork:
                song?.thumbnail || songDetails?.thumbnailUrl || thumbnail,
            };
            get().songQuality.set(song.id, songDetails?.audioStreams!);
            await TrackPlayer.add(remoteSongObject).then(() => {
              set({ songs: [...get().songs, song] });
              stream.addToDownloadMap(
                song?.id,
                songDetails?.audioStream?.url || '',
              );
            });
          }
        }
        stream.downloadMap();
        setMessage(songs?.message || '');
        get().setLoading(false);
        return songs;
      },
    }),
    {
      name: 'playlist',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
