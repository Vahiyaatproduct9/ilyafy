import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import theme from '../../data/color/theme';
import { Image } from 'react-native';
import Icon from '../icons/icon';
import Play from '../../assets/icons/play.svg';
import Pause from '../../assets/icons/pause.svg';
import Next from '../../assets/icons/next.svg';
import Previous from '../../assets/icons/previous.svg';
import Playlist from '../../assets/icons/playlist.svg';

const MacroPlayer = (props: { style?: AnimatedStyle }) => {
  const { width, height } = Dimensions.get('screen');
  return (
    <Animated.View
      className={'absolute overflow-hidden'}
      style={[
        props.style,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          backgroundColor: theme.primary,
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
        },
      ]}
    >
      <View className="w-full p-2 items-center">
        <Text className="text-xl" style={{ color: theme.text }}>
          Ilyafy
        </Text>
      </View>
      <View className="w-full gap-5 p-1 flex-1 items-center justify-center">
        <Image
          source={require('../../assets/images/background.png')}
          className="w-full rounded-[32px]"
          style={{
            height: width,
          }}
        />
        <View className="w-full p-2 bg-white">
          <ProgressBar />
        </View>
        <View className="flex-row mt-20 p-2 w-full justify-center gap-10">
          <Icon
            component={Previous}
            size={40}
            fill="white"
            className="border-2 border-white p-2"
          />
          <Icon
            component={Play}
            size={40}
            fill="white"
            className="border-2 border-white p-2"
          />
          <Icon
            component={Next}
            size={40}
            fill="white"
            className="border-2 border-white p-2"
          />
        </View>
      </View>
    </Animated.View>
  );
};

export default MacroPlayer;

const ProgressBar = () => {
  return (
    <View
      className="h-2 w-full rounded-xl overflow-hidden"
      style={{ backgroundColor: theme.secondary }}
    >
      <Animated.View
        className={'bg-slate-600 flex-1 rounded-xl'}
        style={{
          width: '43%',
        }}
      />
    </View>
  );
};
