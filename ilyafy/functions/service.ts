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
  const replaceSong = useSongs?.getState()?.replace;
  const accessToken = useProfile?.getState()?.accessToken;
  const setMessage = useMessage?.getState()?.setMessage;
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
    const CurrentSong = useCurrentTrack?.getState()?.track;
    const CurrentSongId = CurrentSong?.mediaId;
    await control.remoteSkip((await TrackPlayer.getActiveTrackIndex() || 0) + 1, 0)
    const updatedSong = await stream.update(CurrentSongId || '', accessToken || '');
    console.log('songid:', CurrentSongId);
    console.log('Update Song:', updatedSong);
    const headers = updatedSong?.headers;
    const metadata = updatedSong?.metadata;
    const localPath = updatedSong?.localPath;
    const url = localPath || headers?.filePath || metadata?.url || undefined;
    const newSongObject = {
      title: metadata?.title || headers['X-Track-Title'] || 'Unknown Song',
      url,
      artist: metadata?.artist || headers['X-Track-Artist'] || 'Ilyafy',
      artwork: metadata?.thumbnail || headers['X-Track-Thumb'] || '',
      mediaId: metadata?.id || headers['X-Id'] || CurrentSong?.mediaId,
      localPath
    };
    console.log('New Song Object:', newSongObject);
    if (url) {
      replaceSong(newSongObject);
      await TrackPlayer.play();
    } else {
      setMessage('Already Reading.')
      console.log('URL not found');
    }
  });
  let bufferingTimeout: number | null = null;
  TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
    // Clear the timeout if the state is no longer buffering
    if (event.state !== State.Buffering && bufferingTimeout) {
      clearTimeout(bufferingTimeout);
      bufferingTimeout = null;
    }

    switch (event.state) {
      case State.Buffering:
      case State.Ready:
        // If we start buffering and no timeout is set, create one.
        if (!bufferingTimeout) {
          bufferingTimeout = setTimeout(() => {
            control.remoteBuffer();
            bufferingTimeout = null; // Clear after firing
          }, 500);
        }
        break;

      case State.Playing:
      case State.Paused:
        // Do nothing for these states, as they are handled by other remote event listeners.
        break;

      default:
        // For all other states (e.g., Ready, Loading, Stopped, Ended), send the state directly.
        control.remotePlaybackState(event.state);
        break;
    }
  });
};
commandListener();