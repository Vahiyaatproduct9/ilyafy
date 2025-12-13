import TrackPlayer, { Event, State } from 'react-native-track-player';
import useProfile from '../store/useProfile';
import useSongs from '../store/useSongs';
import commandListener from './stream/commandListener';
import useCurrentTrack from '../store/useCurrentTrack';
import stream from './stream/stream';
import useMessage from '../store/useMessage';
import control from './stream/control';
export default async function () {
  // CONTAINS ONLY REMOTE!!!!!!!!!!
  const replaceSong = useSongs.getState().replace;
  const accessToken = useProfile.getState().accessToken;
  const setMessage = useMessage.getState().setMessage;
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    control.remotePlay();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    control.remotePause();
  });
  TrackPlayer.addEventListener(Event.RemoteSeek, async ({ position }) => {
    control.remoteSeek(position)
  })
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.stop()
    control.remotePlaybackState(State.Ended)
  });
  TrackPlayer.addEventListener(Event.RemoteSkip, async event => {
    control.remoteSkip(event.index)
    console.log('Skipped: ', event)
  })
  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    await TrackPlayer.skipToNext()
    const currentIndex = await TrackPlayer.getActiveTrackIndex();
    currentIndex && control.remoteSkip(currentIndex, 0)
  })
  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    await TrackPlayer.skipToPrevious()
    const currentIndex = await TrackPlayer.getActiveTrackIndex();
    currentIndex && control.remoteSkip(currentIndex, 0)
  })
  TrackPlayer.addEventListener(Event.PlaybackError, async (s) => {
    setMessage(s.message);
    console.log('playback error:', s)
    // tell server to update the database
    const CurrentSong = useCurrentTrack.getState().track;
    const updatedSong = await stream.update(CurrentSong?.mediaId || '', accessToken || '');
    console.log('songid:', CurrentSong?.mediaId);
    console.log('Update Song:', updatedSong);
    const headers = updatedSong?.headers;
    const metadata = updatedSong?.metadata;
    const localPath = updatedSong?.localPath;
    const url = headers?.filePath || localPath || metadata?.url || undefined;
    if (url) {
      replaceSong({
        title: metadata?.title || headers['X-Track-Title'] || 'Unknown Song',
        url,
        artist: metadata?.artist || headers['X-Track-Artist'] || 'Ilyafy',
        artwork: metadata?.thumbnail || headers['X-Track-Thumb'] || '',
        mediaId: metadata?.id || headers['X-Id'] || CurrentSong?.mediaId,
        localPath
      });
      await TrackPlayer.play();
    } else {
      setMessage('URL not found, ignoring this song.')
      console.log('URL not found');
    }
  });
  TrackPlayer.addEventListener(Event.PlaybackState, async event => {
    if (![State.Playing, State.Paused].includes(event.state)) {
      control.remotePlaybackState(event.state)
    }
  });
};
commandListener();