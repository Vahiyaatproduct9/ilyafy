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
const userId = useSocketStore.getState().userId;
const roomId = useProfile.getState().profile?.room_part_of;
const queue = await TrackPlayer.getQueue();
const track = await TrackPlayer.getActiveTrack();
const addSong = useSongs.getState().addSong;
const shouldPlay = useCurrentTrack.getState().shouldPlay;
const executePlay = () => commandEmitter.on(State.Playing, async data => {
  shouldPlay(true);
  if (!data?.position) return;
  console.log('data:', data);
  const currentSong = await TrackPlayer.getActiveTrack();
  const progress = await TrackPlayer.getProgress();
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
const executePause = () => commandEmitter.on(State.Paused, async data => {
  shouldPlay(true);
  if (!data?.position) return;
  const currentSong = await TrackPlayer.getActiveTrack()
  const currentSongIndex = queue.findIndex(t => t.mediaId === data.songId);
  if (data?.songId === currentSong?.mediaId) {
    await TrackPlayer.seekTo(data.position);
  } else {
    await TrackPlayer.skip(currentSongIndex, data?.position || 0);
  }
  await TrackPlayer.pause();
  toast('They paused a song.');
})
const executeBuffering = () => commandEmitter.on(State.Buffering, async () => {
  await TrackPlayer.pause();
  shouldPlay(false);
  toast('They are buffering, Please wait :(');
})
const executeSkip = () => commandEmitter.on('skip', async data => {
  const songIndex = queue.findIndex(t => t.mediaId === data.songId)
  await TrackPlayer.skip(songIndex, data.position);
  await TrackPlayer.play();
  toast('They skipped a song.')
})
const executeStop = () => commandEmitter.on(State.Ended, async () => {
  await TrackPlayer.pause();
  toast('Playlist Ended :(')
})
const executeHeartbeat = () => commandEmitter.on('heartbeat', async (data: heartbeatDataType) => {
  if (data.userId === userId || data.roomId !== roomId) return;
  const localProgress = await TrackPlayer.getProgress()
  const dif = Math.abs(data.position - localProgress.position)
  if (dif > 5) {
    await TrackPlayer.seekTo(data.position)
  }
  if (data?.songId && track && data.songId !== track.mediaId) {
    const index = queue.findIndex(t => t.mediaId === data.songId)
    if (index === -1) {
      const { success, song } = await get(data?.songId);
      let songIndex;
      if (success && song !== undefined) {
        const accessToken = useProfile.getState().accessToken;
        const saveSong = await stream.update(song?.mediaId || '', accessToken || '');
        const headers = saveSong?.headers;
        songIndex = headers['X-Id'];
        const localPath = saveSong?.localPath;
        saveSong && await addSong({
          mediaId: song?.id || song?.mediaId || Date.now().toString(),
          url: headers?.filePath || localPath || song.url || '',
          artist: song.artist || 'Ilyafy',
          artwork: song.thumbnail || require('../assets/images/background.png'),
          title: song?.title || 'Unknown Song'
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
  executeSkip();
  executeStop();
  executeHeartbeat();
}