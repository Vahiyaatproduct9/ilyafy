import TrackPlayer, { Event, State, Track } from 'react-native-track-player';
import { create } from 'zustand';
type currentTrack = {
  track: Track | null;
  initialized: boolean;
  position: number | null;
  duration: number | null;
  isPlaying: boolean;
  setTrack: () => Promise<void>;
  initializePlayer: () => Promise<void>;
};

export default create<currentTrack>((set, get) => ({
  track: null,
  initialized: false,
  position: null,
  duration: null,
  isPlaying: false,
  setTrack: async (remoteTrack?: Track) => {
    const track = remoteTrack || (await TrackPlayer.getActiveTrack()) || null;
    set({ track });
    TrackPlayer.addEventListener(Event.PlaybackState, data => {
      data.state !== State.None;
    });
  },
  initializePlayer: async () => {
    if (get().initialized) return;
    TrackPlayer.addEventListener(
      Event.PlaybackActiveTrackChanged,
      async data => {
        console.log('ActiveTrackChanged!');
        set({ track: data.track });
        const { position, duration } = await TrackPlayer.getProgress();
        set({ position, duration });
      },
    );
    TrackPlayer.addEventListener(Event.PlaybackState, data => {
      set({ isPlaying: data.state === State.Playing });
    });
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, d => {
      set({ position: d.position, duration: d.duration });
    });
    set({ initialized: true });
  },
}));
