import TrackPlayer, { Progress, State } from "react-native-track-player";
import useSocketStore from "../../store/useSocketStore";
// import stream from "./stream";
// import useProfile from "../../store/useProfile";
import useCurrentTrack from "../../store/useCurrentTrack";
import toast from "../../components/message/toast";
class Control {
  private readonly sendMessage: (arg: object) => Promise<boolean>;
  constructor() {
    this.sendMessage = useSocketStore?.getState()?.sendMessage;
  }
  private async sigPause() {
    const progress = await TrackPlayer.getProgress();
    this.sendMessage({
      state: State.Paused,
      ...progress,
    })
  }
  private async sigPlay() {
    const progress = await TrackPlayer.getProgress();
    this.sendMessage({
      state: State.Playing,
      ...progress
    })
  }

  private async sigSeek(progress?: Progress) {
    const lProgress = progress || await TrackPlayer.getProgress();
    this.sendMessage({
      ...lProgress,
      state: 'seek'
    })
  }
  private async sigSkip(arg: object) {
    const progress = await TrackPlayer.getProgress();
    this.sendMessage({
      ...progress,
      ...arg,
      state: State.Playing,
    })
  }
  public async remotePlay() {
    const canBePlayed = useCurrentTrack?.getState()?.canBePlayed;
    if (!canBePlayed) {
      toast('They are buffering, please wait!');
      return;
    }
    TrackPlayer.play()
      .then(() => {
        this.sigPlay()
      })
  }
  public remotePause() {
    TrackPlayer.pause()
      .then(() => {
        this.sigPause()
      })
  }
  public async remoteSkip(index: number, position?: number) {
    await TrackPlayer.skip(index, position || 0);
    await TrackPlayer.play();
    const newTrack = await TrackPlayer.getActiveTrack();
    const progress = await TrackPlayer.getProgress();
    const songId = newTrack?.mediaId;
    this.sigSkip({
      songId,
      ...progress
    })
  }
  public remoteSeek(position: number) {
    TrackPlayer.seekTo(position)
      .then(() => {
        this.sigSeek()
      })
  }
  public async remoteBuffer() {
    this.sendMessage({
      state: State.Buffering,
    })
  }
  public async remotePlaybackState(state: State) {
    this.sendMessage({
      state
    })
  }
}

export default new Control();