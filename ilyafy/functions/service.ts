import TrackPlayer, { Event, State } from 'react-native-track-player';
import useSocketStore, { commandEmitter } from '../store/useSocketStore';
export default async function () {
  const sendMessage = useSocketStore.getState().sendMessage
  const user_id = useSocketStore.getState().user_id
  const queue = await TrackPlayer.getQueue()
  const track = await TrackPlayer.getActiveTrack()
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    const progress = await TrackPlayer.getProgress()
    sendMessage({
      state: 'play',
      data: { progress }
    })
    await TrackPlayer.play()
  });
  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    const progress = await TrackPlayer.getProgress()
    sendMessage({
      state: 'pause',
      data: { progress }
    })
    await TrackPlayer.pause()
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, async ({ position }) => {
    const progress = await TrackPlayer.getProgress();
    sendMessage({
      state: 'seek',
      data: { progress, position }
    })
    await TrackPlayer.seekTo(position)
  })
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    sendMessage({
      state: 'stop',
      data: null
    })
    await TrackPlayer.stop()
  });
  TrackPlayer.addEventListener(Event.RemoteSkip, async event => {
    sendMessage({
      state: 'skip',
      data: { event },
    })
    console.log('Skipped: ', event)
    await TrackPlayer.skip(event.index)
  })
  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    await TrackPlayer.skipToNext()
    const nextSongId = await TrackPlayer.getActiveTrackIndex()
    sendMessage({
      state: 'next',
      data: {
        track_id: nextSongId
      }
    })
  })
  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    await TrackPlayer.skipToPrevious()
    const prevSongId = await TrackPlayer.getActiveTrackIndex()

    sendMessage({
      state: 'previous',
      data: {
        track_id: prevSongId,
      }
    })
  })
  commandEmitter.on('play', async data => {
    if (data?.progress?.position)
      await TrackPlayer.seekTo(data.progress.position)
    await TrackPlayer.play()
  })
  commandEmitter.on('pause', async data => {
    await TrackPlayer.seekTo(data.progress.position)
    await TrackPlayer.pause()
  })
  commandEmitter.on('seek', async data => {
    if (data?.position) {
      await TrackPlayer.seekTo(data.position)
    }
  })
  commandEmitter.on('next', async data => {
    const dTrack = data.track_id;
    const index = queue.findIndex(t => t.id === dTrack.id);
    await TrackPlayer.skip(index)
  })
  commandEmitter.on('previous', async data => {
    const dTrack = data.track_id;
    const index = queue.findIndex(t => t.id === dTrack.id);
    await TrackPlayer.skip(index)
  })

  commandEmitter.on('heartbeat', async data => {
    const progress = data.progress;
    if (data.user_id === user_id && data.room_id === '3') return;
    const localProgress = await TrackPlayer.getProgress()
    const dif = Math.abs(progress.position - localProgress.position)
    if (dif > 5) {
      await TrackPlayer.seekTo(progress.position)
    }
    if (data?.track_id && track && data.track_id !== track.id) {
      const index = queue.findIndex(t => t.id === data.track_id)
      await TrackPlayer.skip(index)
    }
    switch (progress.status) {
      case State.Playing:
        await TrackPlayer.play()
        break;
      case State.Stopped:
        await TrackPlayer.stop()
        break;
      case State.Buffering:
        await TrackPlayer.pause();
        break;
      case State.Ended:
        await TrackPlayer.pause();
        break;
      case State.None:
        await TrackPlayer.stop();
        break;
      case State.Loading:
        await TrackPlayer.pause();
        break;
      default:
        await TrackPlayer.play();
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
