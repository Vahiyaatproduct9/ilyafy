/* eslint-disable react-native/no-inline-styles */
import { Pressable, useWindowDimensions } from 'react-native';
import React from 'react';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle as Cle } from 'react-native-svg';
import theme from '../../data/color/theme';
const size = 50;
const Circle = () => {
  const dim = useWindowDimensions();
  const height = dim.height;
  const width = dim.width;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  React.useEffect(() => {
    const timer = (8 + Math.random() * 2) * 1000;
    const distance = 100;
    const interval = setInterval(() => {
      translateX.value = withTiming(Math.random() * distance, {
        duration: timer,
        easing: Easing.bezier(0.09, 0.51, 0.41, 1.04),
      });
      translateY.value = withTiming(Math.random() * distance, {
        duration: timer,
      });
    }, timer);
    return () => clearInterval(interval);
  }, [translateX, translateY]);
  const randomPosition = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
        {
          translateY: translateY.value,
        },
      ],
    };
  });
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // translateX.value = e.absoluteX;
    })
    .onUpdate(e => {
      translateY.value = withTiming(translateY.value + e.translationY / 2);
      translateX.value = withTiming(translateX.value + e.translationX / 2);
    })
    .onEnd(() => {});
  const AnimatedSvg = Animated.createAnimatedComponent(Svg);
  return (
    <GestureDetector gesture={panGesture}>
      <Pressable onPress={() => console.log('Heyy')}>
        <AnimatedSvg
          entering={FadeIn.duration(1000)}
          exiting={FadeOut.duration(1000)}
          style={[
            randomPosition,
            {
              position: 'absolute',
              top: Math.random() * height - size,
              right: Math.random() * width - size,
              boxShadow: '0 0 14px 2px rgba(0,0,0,0.2)',
              borderRadius: 1000,
            },
          ]}
          height={'100'}
          width={'100'}
        >
          <Cle fill={theme.secondary} cx={50} cy={50} r={size} />
        </AnimatedSvg>
      </Pressable>
    </GestureDetector>
  );
};

export default Circle;
