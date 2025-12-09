import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from "react-native-track-player";
export default async () => {
    await TrackPlayer.setupPlayer({
        autoUpdateMetadata: true,
        playBuffer: 5,
        autoHandleInterruptions: true,

    });
    await TrackPlayer.updateOptions({
        android: {
            alwaysPauseOnInterruption: true,
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        },
        progressUpdateEventInterval: 1,
        capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SeekTo,
            Capability.Skip,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            // Capability.JumpForward,
            // Capability.JumpBackward,
        ],
        notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SeekTo,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
        ],
    });
}