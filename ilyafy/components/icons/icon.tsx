/* eslint-disable no-return-assign */
/* eslint-disable react-native/no-inline-styles */
// import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import React, { FC } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SvgProps } from 'react-native-svg';

type IconProps = {
  component: React.ComponentType<React.SVGProps<SVGElement>> | FC<SvgProps>;
  size?: number;
  className?: string;
  fill?: string;
  onPress?: () => void;
};
const Icon = ({
  component: Component,
  size = 28,
  fill,
  className,
  onPress,
  ...rest
}: IconProps) => {
  const animateSize = useSharedValue(1);
  const AnPressable = Animated.createAnimatedComponent(Pressable);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: animateSize.value }],
    };
  });
  return (
    <AnPressable
      onPress={onPress}
      onPressIn={() =>
        (animateSize.value = withTiming(0.92, { duration: 300 }))
      }
      onPressOut={() => (animateSize.value = withTiming(1, { duration: 300 }))}
      className={className}
      style={[
        animatedStyle,
        {
          justifyContent: 'center',
          alignItems: 'center',
          aspectRatio: 1,
          height: 'auto',
          width: 'auto',
          borderRadius: 1000,
        },
      ]}
    >
      <Component height={size} width={size} fill={fill || ''} {...rest} />
    </AnPressable>
  );
};

export default Icon;
