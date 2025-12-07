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

const MiniPlayer = ({ style }: { style: AnimatedStyle }) => {
  const isPlaying = useCurrentTrack(s => s.isPlaying);
  const track = useCurrentTrack(s => s.track);
  async function togglePlay() {
    if (isPlaying) await TrackPlayer.pause();
    else await TrackPlayer.play();
  }
  async function skipSong() {
    await TrackPlayer.skipToNext();
  }
  return (
    <Animated.View
      className={'py-3 px-6 flex-row justify-center items-center'}
      style={style}
    >
      <View className="flex-1">
        <Text
          className={'font-semibold text-2xl'}
          style={{
            color: theme.text,
          }}
        >
          {track?.title || 'Unknown Song'}
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
