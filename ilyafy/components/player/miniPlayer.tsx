import { Text, View } from 'react-native';
import React from 'react';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import theme from '../../data/color/theme';
import Icon from '../icons/icon';
import Play from '../../assets/icons/play.svg';
import Pause from '../../assets/icons/pause.svg';
import Next from '../../assets/icons/next.svg';
import useCurrentTrack from '../../store/useCurrentTrack';
import TrackPlayer from 'react-native-track-player';
import control from '../../functions/stream/control';
import useMessage from '../../store/useMessage';
import stripWords from '../../functions/miscellanous/stripWords';

const MiniPlayer = ({ style }: { style: AnimatedStyle }) => {
  const isPlaying = useCurrentTrack(s => s.isPlaying);
  const setMessage = useMessage?.getState()?.setMessage;
  const canBePlayed = useCurrentTrack(s => s.canBePlayed);
  const track = useCurrentTrack(s => s.track);
  async function togglePlay() {
    if (isPlaying) await control.remotePause();
    else if (canBePlayed) await control.remotePlay();
    else setMessage('They are buffering, please wait!');
  }
  async function skipSong() {
    await control.remoteSkip(
      ((await TrackPlayer.getActiveTrackIndex()) || 0) + 1,
      0,
    );
  }
  return (
    <Animated.View
      className={'py-3 px-6 flex-row justify-center items-center'}
      style={style}
    >
      <View className="flex-1">
        <Text
          className={'font-semibold text-xl'}
          style={{
            color: theme.text,
          }}
        >
          {stripWords(track?.title || 'Unknown Song')}
        </Text>
        <Text className="" style={{ color: theme.text }}>
          {track?.artist || 'Ilyafy'}
        </Text>
      </View>
      <View className="flex-row py-4 items-center justify-center gap-5">
        <Icon
          component={isPlaying ? Pause : Play}
          size={30}
          onPress={togglePlay}
          fill="white"
        />
        <Icon component={Next} onPress={skipSong} size={30} fill="white" />
      </View>
    </Animated.View>
  );
};

export default MiniPlayer;
