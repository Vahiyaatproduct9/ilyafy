import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from "react-native-track-player";
export default async () => {
    await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
    });
    await TrackPlayer.updateOptions({
        android: {
            alwaysPauseOnInterruption: true,
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback
        },
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
    TrackPlayer.play()
}