import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const Loading = () => {
  const rotateValue = useSharedValue(0);
  useEffect(() => {
    const interval = setInterval(() => {
      rotateValue.value = withTiming(rotateValue.value + 100, {
        duration: 1000,
        easing: Easing.linear,
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rotateValue]);
  const animatedLoader = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotateValue.value}deg` }],
    };
  });
  return (
    <View className="w-full items-center justify-center py-10 mb-[80px] gap-5">
      <Animated.Image
        source={require('../../assets/images/tenor.gif')}
        style={[
          {
            borderRadius: 100,
            height: 60,
            width: 60,
            aspectRatio: 1,
          },
          animatedLoader,
        ]}
      />
      <Text className="text-l color-white">
        Please wait we are trying our best :D
      </Text>
    </View>
  );
};

export default Loading;
