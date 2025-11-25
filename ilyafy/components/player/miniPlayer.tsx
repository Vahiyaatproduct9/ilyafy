import { Text, View } from 'react-native';
import React from 'react';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import theme from '../../data/color/theme';
import Icon from '../icons/icon';
import Play from '../../assets/icons/play.svg';
import Next from '../../assets/icons/next.svg';

const MiniPlayer = ({ style }: { style: AnimatedStyle }) => {
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
          Title
        </Text>
        <Text className="" style={{ color: theme.text }}>
          Artist
        </Text>
      </View>
      <View className="flex-row py-4 items-center justify-center gap-5">
        <Icon component={Play} size={30} fill="white" />
        <Icon component={Next} size={30} fill="white" />
      </View>
    </Animated.View>
  );
};

export default MiniPlayer;
