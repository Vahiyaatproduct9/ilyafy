import TrackPlayer, { Event, State } from 'react-native-track-player';
import useSocketStore, { commandEmitter } from '../store/useSocketStore';
import { heartbeatDataType } from '../types/commandEmmiter';
import useProfile from '../store/useProfile';
import toast from '../components/message/toast';
import get from '../api/playlist/get';
import useSongs from '../store/useSongs';
export default async function () {
  const addSong = useSongs.getState().addSong;
  const sendMessage = useSocketStore.getState().sendMessage;
  const userId = useSocketStore.getState().userId;
  const roomId = useProfile.getState().profile?.room_part_of;
  const queue = await TrackPlayer.getQueue();
  const track = await TrackPlayer.getActiveTrack();
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    await TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    await TrackPlayer.pause();
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, async ({ position }) => {
    await TrackPlayer.seekTo(position)
  })
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.stop()
    sendMessage({
      state: 'stop',
    })
  });
  TrackPlayer.addEventListener(Event.RemoteSkip, async event => {
    await TrackPlayer.skip(event.index)
    await TrackPlayer.play();
    console.log('Skipped: ', event)
  })
  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    await TrackPlayer.skipToNext()
    await TrackPlayer.play();
  })
  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    await TrackPlayer.skipToPrevious()
    await TrackPlayer.play();
  })
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async event => {
    const progress = await TrackPlayer.getProgress();
    sendMessage({
      state: 'skip',
      ...event,
      songId: event.track?.mediaId || '',
      ...progress
    })
  });
  TrackPlayer.addEventListener(Event.PlaybackError, () => {
    sendMessage({
      state: 'error',
    });
  });
  TrackPlayer.addEventListener(Event.PlaybackState, async event => {
    const progress = await TrackPlayer.getProgress();
    if ([State.Playing, State.Paused].includes(event.state)) {
      sendMessage({
        state: event.state,
        ...progress
      })
    }
  })
  commandEmitter.on(State.Playing, async data => {
    if (!data?.position) return;
    const currentSong = await TrackPlayer.getActiveTrack()
    const progress = await TrackPlayer.getProgress();
    const currentSongIndex = queue.findIndex(t => t.mediaId === data.songId);
    if (data?.songId === currentSong?.mediaId) {
      if (Math.abs((progress.position - data?.position) || 0) > 5)
        toast('They seeked a song.')
      else
        toast('They are playing a song.')
      await TrackPlayer.seekTo(data.position);
    } else {
      await TrackPlayer.skip(currentSongIndex, data?.position || 0);
      toast('They skipped a song.')
    }
    await TrackPlayer.play();
  })
  commandEmitter.on(State.Paused, async data => {
    if (!data?.position) return;
    const currentSong = await TrackPlayer.getActiveTrack()
    const currentSongIndex = queue.findIndex(t => t.mediaId === data.songId);
    if (data?.songId === currentSong?.mediaId) {
      await TrackPlayer.seekTo(data.position);
    } else {
      await TrackPlayer.skip(currentSongIndex, data?.position || 0);
    }
    await TrackPlayer.pause();
    toast('They paused a song.')
  })
  commandEmitter.on('skip', async data => {
    const songIndex = queue.findIndex(t => t.mediaId === data.songId)
    await TrackPlayer.skip(songIndex, data.position);
    await TrackPlayer.play();
    toast('They skipped a song.')
  })
  commandEmitter.on('stop', async () => {
    await TrackPlayer.pause();
    toast('They exited :(')
  })
  commandEmitter.on('heartbeat', async (data: heartbeatDataType) => {
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
          await addSong({
            mediaId: song?.id || song?.mediaId || Date.now().toString(),
            url: song.url || '',
            artist: song.artist || 'Ilyafy',
            artwork: song.thumbnail || require('../assets/images/background.png'),
            title: song?.title || 'Unknown Song'
          })
          songIndex && await TrackPlayer.skip(songIndex, data?.position);
        }
      }
      else await TrackPlayer.skip(index, data.position)
      toast('Fixed errors :)')
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
  TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
    if (state === State.Paused) {
      console.log('⏸️ Player paused in background service');
    } else if (state === State.Playing) {
      console.log('▶️ Player started in background service');
    }
  });
};
