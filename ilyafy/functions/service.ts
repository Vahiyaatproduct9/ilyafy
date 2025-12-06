import TrackPlayer, { Event, State } from 'react-native-track-player';
import useSocketStore, { commandEmitter } from '../store/useSocketStore';
import { heartbeatDataType } from '../types/commandEmmiter';
import useProfile from '../store/useProfile';
import toast from '../components/message/toast';
import get from '../api/playlist/get';
export default async function () {
  const sendMessage = useSocketStore.getState().sendMessage;
  const userId = useSocketStore.getState().userId;
  const roomId = useProfile.getState().profile?.room_part_of;
  const queue = await TrackPlayer.getQueue();
  const track = await TrackPlayer.getActiveTrack();
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    const progress = await TrackPlayer.getProgress();
    sendMessage({
      state: 'play',
      ...progress
    })
    await TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    const progress = await TrackPlayer.getProgress();
    sendMessage({
      state: 'pause',
      ...progress
    })
    await TrackPlayer.pause();
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, async ({ position }) => {
    const progress = await TrackPlayer.getProgress();
    sendMessage({
      state: 'seek',
      ...progress,
      position,
    })
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
    const progress = await TrackPlayer.getProgress();
    sendMessage({
      state: 'skip',
      ...event,
      ...progress
    })
    console.log('Skipped: ', event)
  })
  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    await TrackPlayer.skipToNext()
    await TrackPlayer.play();
    const nextSongIndex = await TrackPlayer.getActiveTrackIndex()
    const nextSongId = queue[nextSongIndex || 0]?.mediaId || '';
    const progress = await TrackPlayer.getProgress();
    sendMessage({
      state: 'skip',
      songId: nextSongId,
      ...progress
    })
  })
  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    await TrackPlayer.skipToPrevious()
    await TrackPlayer.play();
    const prevSongIndex = await TrackPlayer.getActiveTrackIndex()
    const nextSongId = queue[prevSongIndex || 0]?.mediaId || ''
    const progress = await TrackPlayer.getProgress();

    sendMessage({
      state: 'skip',
      songId: nextSongId,
      ...progress
    })
  })
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async event => {
    const progress = await TrackPlayer.getProgress();
    sendMessage({
      state: 'skip',
      songId: event.track?.mediaId || '',
      ...progress
    })
  });
  TrackPlayer.addEventListener(Event.PlaybackError, () => {
    sendMessage({
      state: 'error',
    });
  });
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    sendMessage({
      state: 'ended'
    })
  });
  TrackPlayer.addEventListener(Event.PlaybackState, async event => {
    if ([State.Playing, State.Paused].includes(event.state)) {
      sendMessage({
        state: event.state
      })
    }
  })
  commandEmitter.on('play', async data => {
    if (!data?.position) return;
    const currentSong = await TrackPlayer.getActiveTrack()
    const currentSongIndex = queue.findIndex(t => t.mediaId === data.songId);
    if (data?.songId === currentSong?.mediaId) {
      await TrackPlayer.seekTo(data.position);
    } else {
      await TrackPlayer.skip(currentSongIndex, data?.position || 0);
    }
    await TrackPlayer.play();
    toast('They are playing a song.')
  })
  commandEmitter.on('pause', async data => {
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
  commandEmitter.on('seek', async data => {
    if (!data?.position) return;
    const currentSong = await TrackPlayer.getActiveTrack()
    const currentSongIndex = queue.findIndex(t => t.mediaId === data.songId);
    if (data?.songId !== currentSong?.mediaId) {
      await TrackPlayer.skip(currentSongIndex)
    }
    await TrackPlayer.seekTo(data.position)
    toast('They seeked a song.')
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
          //REFINE WITH FUNCTION ...
          // songIndex = await TrackPlayer.add({
          //   mediaId: song.mediaId || Date.now().toString(),
          //   url: song.url || '',
          //   artist: song.artist || 'Ilyafy',
          //   artwork: song.thumbnail,
          //   title: song.title
          // });
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
