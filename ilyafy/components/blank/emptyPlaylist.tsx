import { Text } from 'react-native';
import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import theme from '../../data/color/theme';

const EmptyPlaylist = () => {
  return (
    <>
      <Animated.View
        className={'mt-20 gap-5'}
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(250)}
      >
        <Text className="text-2xl font-normal self-start color-gray-700">
          No
        </Text>
        <Text
          className="text-3xl font-semibold color-gray-800"
          style={{ color: theme.primary }}
        >
          Songs :)
        </Text>
        <Text className="text-2xl font-normal self-end color-gray-700">
          yet
        </Text>
      </Animated.View>
      <Animated.View
        className={'absolute bottom-40'}
        entering={FadeIn.duration(250).delay(250)}
        exiting={FadeOut.duration(250)}
      >
        <Text className="text-xl font-light color-white">
          Click '+' to add songs.
        </Text>
      </Animated.View>
    </>
  );
};

export default EmptyPlaylist;
