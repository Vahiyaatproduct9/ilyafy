import { commandEmitter } from "../../store/useSocketStore";
import TrackPlayer, { State } from "react-native-track-player";
import useSocketStore from "../../store/useSocketStore";
import useProfile from "../../store/useProfile";
import toast from "../../components/message/toast";
import stream from "./stream";
import { heartbeatDataType } from "../../types/commandEmmiter";
import get from "../../api/playlist/get";
import useSongs from "../../store/useSongs";
import useCurrentTrack from "../../store/useCurrentTrack";
import control from "./control";
const userId = useSocketStore?.getState()?.userId;
const roomId = useProfile?.getState()?.profile?.room_part_of;
const addSong = useSongs?.getState()?.addSong;
const shouldPlay = useCurrentTrack?.getState()?.shouldPlay;
export const executePlay = () => commandEmitter.on(State.Playing, async data => {
  shouldPlay(true);
  if (!data?.position || data?.position === 0) {
    await TrackPlayer.pause()
    toast('They are facing some Error!')
    return;
  };
  console.log('data:', data);
  const currentSong = await TrackPlayer.getActiveTrack();
  const progress = await TrackPlayer.getProgress();
  const queue = await TrackPlayer.getQueue();
  const currentSongIndex = queue.findIndex(t => t.mediaId === data.songId);
  if (data?.songId === currentSong?.mediaId) {
    if (Math.abs((progress.position - data?.position) || 0) > 5) {
      toast('They seeked a song.');
      await TrackPlayer.seekTo(data.position);
    }
    else
      toast('They are playing a song.');
  } else {
    await TrackPlayer.skip(currentSongIndex, data?.position || 0);
    toast('They skipped a song.');
  }
  await TrackPlayer.play();
})
export const executePause = () => commandEmitter.on(State.Paused, async data => {
  shouldPlay(true);
  if (!data?.position) return;
  const currentSong = await TrackPlayer.getActiveTrack();
  const queue = await TrackPlayer.getQueue();
  const currentSongIndex = queue.findIndex(t => t.mediaId === data.songId);
  if (data?.songId === currentSong?.mediaId) {
    await TrackPlayer.seekTo(data.position);
  } else {
    await TrackPlayer.skip(currentSongIndex, data?.position || 0);
  }
  await TrackPlayer.pause();
  toast('They paused a song.');
})
export const executeBuffering = () => commandEmitter.on(State.Buffering, async () => {
  await TrackPlayer.pause();
  shouldPlay(false);
  toast('They are buffering, Please wait :(');
})
export const executeReady = () => commandEmitter.on(State.Ready, async () => {
  shouldPlay(true);
  toast('They are ready to play!');
});

export const executeSeek = () => commandEmitter.on('seek', async data => {
  const { state } = await TrackPlayer.getPlaybackState();
  data?.position && await TrackPlayer.seekTo(data?.position)
    .then(() => {
      if (state === State.Playing) {
        control.remotePlay()
      } else if (state === State.Paused) {
        control.remotePause()
      } else {
        TrackPlayer.pause();
        toast('They are in ' + state + 'state.');
      }
    })
})
export const executeSkip = () => commandEmitter.on('skip', async data => {
  const queue = await TrackPlayer.getQueue();
  const songIndex = queue.findIndex(t => t.mediaId === data.songId)
  await TrackPlayer.skip(songIndex, data.position);
  await TrackPlayer.play();
  toast('They skipped a song.')
})
export const executeStop = () => commandEmitter.on(State.Ended, async () => {
  await TrackPlayer.pause();
  toast('Playlist Ended :(')
})
export const executeHeartbeat = () => commandEmitter.on('heartbeat', async (data: heartbeatDataType) => {
  if (data.userId === userId || data.roomId !== roomId) return;
  const localProgress = await TrackPlayer.getProgress()
  const tracks = useSongs.getState().songs;
  const currentTrack = useCurrentTrack.getState().track;
  if (currentTrack?.mediaId !== data.songId) {
    const currentRemoteSongIndex = tracks.findIndex(t => t.mediaId === data.songId);
    if (currentRemoteSongIndex === -1) {
      // get song from server

      await TrackPlayer.reset().then(async () => {
        await TrackPlayer.add(tracks);
      });

    }
    await TrackPlayer.skip(currentRemoteSongIndex, data.position);
  }
  const dif = Math.abs(data.position - localProgress.position)
  if (dif > 5) {
    await TrackPlayer.seekTo(data.position)
  }
  const track = await TrackPlayer.getActiveTrack();
  if (data?.songId && track && data.songId !== track.mediaId) {
    const queue = await TrackPlayer.getQueue();
    const index = queue.findIndex(t => t.mediaId === data.songId)
    if (index === -1) {
      const { success, song } = await get(data?.songId);
      let songIndex;
      if (success && song !== undefined) {
        const saveSong = await stream.localGet(song?.ytUrl || '', song?.id || '');
        const metadata = saveSong?.metadata;
        const localPath = saveSong?.localPath;
        saveSong && await addSong({
          mediaId: song?.id || song?.mediaId || Date.now().toString(),
          url: localPath || metadata?.url || song.url || '',
          artist: song?.artist || metadata?.artist || 'Ilyafy',
          artwork: song?.thumbnail || metadata?.thumbnail || require('../../assets/images/background.png'),
          title: song?.title || metadata?.thumbnail || 'Unknown Song'
        })
        songIndex && await TrackPlayer.skip(songIndex, data?.position);
      }
    }
    else await TrackPlayer.skip(index, data.position)
    toast('Fixed errors :)')
  } else {
    toast('Some Error Occured, Please report to the creator.')
  }
  switch (data.status) {
    case State.Playing:
      await TrackPlayer.play()
      break;
    default:
      await TrackPlayer.pause();
      break;
  }
})


export default () => {
  executePlay();
  executePause();
  executeBuffering();
  executeSeek();
  executeReady();
  executeSkip();
  executeStop();
  executeHeartbeat();
}