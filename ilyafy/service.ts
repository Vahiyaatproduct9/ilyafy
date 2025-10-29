import TrackPlayer, { Event, State } from 'react-native-track-player';
export default async function () {
  console.log('Started Listening')
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePlayPause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteSeek, () => console.log('Seeked'))
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
    if (state === State.Paused) {
      console.log('⏸️ Player paused in background service');
    } else if (state === State.Playing) {
      console.log('▶️ Player started in background service');
    }
  });
};
