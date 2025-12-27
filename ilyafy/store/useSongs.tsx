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
import useProfile from './useProfile';
import local from '../api/playlist/local';
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
          const roomMember = useProfile.getState().profile?.room_part_of;
          let response;
          console.log('room member:', roomMember);
          if (roomMember) {
            response = await post(url);
          } else {
            response = await local.post(url);
          }
          if (response?.success && response?.song) {
            resolve(response);
            get()
              .addSong({
                ...response?.song,
                mediaId: response?.song?.id,
                id: undefined,
                artwork: response?.song?.thumbnail,
              })
              .then(() => {
                get().setLoading(false);
              });
            return;
          }
          reject(new Error('Fetch Failed'));
          setMessage('Network Error.');
          get().setLoading(false);
        });
      },
      addSong: async song => {
        // const roomMember = useProfile.getState().profile?.room_part_of;

        const songExists = get().songs.find(t => t.id === song?.mediaId);
        if (songExists) {
          if (song?.url.includes('http')) {
            const newSong = await NewPipeModule.extractStream(song?.ytUrl!);
            if (!newSong) {
              setMessage("Couldn't fetch song X(");
              console.error('Error in useSongs.');
              return;
            }
            const bitrateSet = new Set<number>();
            newSong?.audioStreams.forEach(t => bitrateSet.add(t.bitrate));
            const newSongObject: CTrack = {
              url: newSong?.audioStreams.find(
                t => t.bitrate === Math.min(...bitrateSet),
              )?.url!,
              title: newSong?.title,
              artist: song?.artist,
              artwork: song?.artwork,
            };
            get().songQuality.set(song?.mediaId!, newSong?.audioStreams);
            get().replace(newSongObject);
            stream.fetchAndDownload(newSongObject, newSong?.audioStream?.url!);
            return;
          }
          get().replace(song);
          return;
        }
        // SONG DOESNT EXIST IN PLAYLIST
        const roomMember = useProfile.getState().profile?.room_part_of;
        let songDetails;
        if (roomMember) songDetails = await getSongDetail(song?.mediaId || '');
        else songDetails = await local.get(song?.id || song?.mediaId);
        if (song?.url?.includes('http')) {
          if (!songDetails?.success) {
            console.error("Song doesn't exist in playlist.");
            setMessage('Song does not exist.');
            return;
          }
          const newSong = await NewPipeModule.extractStream(
            songDetails?.song?.ytUrl!,
          );
          if (!newSong) {
            setMessage("Couldn't fetch song X(");
            console.error('Error in useSongs.');
            return;
          }
          const bitrateSet = new Set<number>();
          newSong?.audioStreams.forEach(t => bitrateSet.add(t.bitrate));
          const newSongObject: CTrack = {
            url: newSong?.audioStreams.find(
              t => t.bitrate === Math.min(...bitrateSet),
            )?.url!,
            title: newSong?.title,
            artist: song?.artist,
            artwork: song?.artwork,
          };
          get().songQuality.set(songDetails?.song?.id!, newSong?.audioStreams);
          await TrackPlayer.add(newSongObject).then(() => {
            songDetails?.song &&
              set({ songs: [...get().songs, songDetails?.song] });
          });
          stream.fetchAndDownload(newSongObject, newSong?.audioStream?.url!);
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
          await local.delete(queue[index].id);
          await local.post(queue[index]);
          set({ songs: [...queue] });
        });
        console.log('trackplayer queue:', await TrackPlayer.getQueue());
      },
      delete: async id => {
        const roomMember = useProfile.getState().profile?.room_part_of;
        let response;
        if (roomMember) response = await _delete(id);
        else response = await local.delete(id);
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
        set({ songQuality: new Map<string, AudioStream[]>() });
        const roomMember = useProfile.getState().profile?.room_part_of;
        let songs;
        if (roomMember) songs = await list(token || '');
        else songs = await local.list();
        if (!songs?.success) {
          setMessage(songs?.message || 'Network Err X(');
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
            const bitrateSet = new Set<number>();
            for (const streams of songDetails?.audioStreams || []) {
              bitrateSet.add(streams.bitrate);
            }
            const lowestBitrateUrl = songDetails?.audioStreams.find(
              t => t.bitrate === Math.min(...bitrateSet),
            )?.url;
            const thumbnailUrlSet = new Set<number>();
            songDetails?.thumbnails.forEach(t =>
              thumbnailUrlSet.add(t.height * t.width),
            );
            const highestThumbnailUrl = songDetails?.thumbnails.find(
              t => t.height * t.width === Math.max(...thumbnailUrlSet),
            )?.url;
            const remoteSongObject: CTrack = {
              url: lowestBitrateUrl || '',
              title: songDetails?.title || 'Unknown Song',
              artist: songDetails?.uploader || 'Ilyafy',
              mediaId: song?.id,
              artwork: highestThumbnailUrl,
            };
            get().songQuality.set(song?.id, songDetails?.audioStreams || []);
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
