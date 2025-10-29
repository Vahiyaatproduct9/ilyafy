import TrackPlayer, { Capability } from "react-native-track-player";
export default async () => {
    await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
    });
    const state = await TrackPlayer.getPlayWhenReady();
    await TrackPlayer.updateOptions({
        android: {
            alwaysPauseOnInterruption: true,
        },
        capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SeekTo,
            Capability.Skip,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.JumpForward,
            Capability.JumpBackward,
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
    console.log(state);
}