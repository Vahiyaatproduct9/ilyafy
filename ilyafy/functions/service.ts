import TrackPlayer, { Event, State } from 'react-native-track-player';
import useSongs from '../store/useSongs';
import commandListener from './stream/commandListener';
import useCurrentTrack from '../store/useCurrentTrack';
import stream from './stream/stream';
import useMessage from '../store/useMessage';
import control from './stream/control';
import get from '../api/playlist/get';
export default async function () {
  // CONTAINS ONLY REMOTE!!!!!!!!!!
  const replaceSong = useSongs?.getState()?.replace;
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
    await control.remoteSkip((await TrackPlayer.getActiveTrackIndex() || 0) + 1, 0);
    const songDetails = CurrentSongId ? await get(CurrentSongId) : null;
    const updatedSong = songDetails?.success ? await stream.localGet(songDetails?.song?.ytUrl || '', CurrentSongId || '', 'update') : null;
    console.log('songid:', CurrentSongId);
    console.log('Update Song:', updatedSong);
    const metadata = updatedSong?.metadata;
    const localPath = updatedSong?.localPath;
    const url = localPath || metadata?.url || undefined;
    const newSongObject = {
      title: metadata?.title || 'Unknown Song',
      url,
      artist: metadata?.artist || 'Ilyafy',
      artwork: metadata?.thumbnail || '',
      mediaId: metadata?.id || CurrentSong?.mediaId,
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
        break;
      default:
        control.remotePlaybackState(event.state);
        break;
    }
  });
};
commandListener();