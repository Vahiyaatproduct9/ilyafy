import { useEffect } from 'react';
import { Text, Pressable, ViewStyle, TextStyle, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  containerClassName?: string;
  containerStyle?: ViewStyle;
  textClassName?: string;
  textStyle?: ViewStyle | TextStyle;
  onPressIn?: () => void;
  onPress?: () => void;
  onPressOut?: () => void;
  label: string;
  disabled?: boolean;
  loading?: boolean | null;
}

const Button = ({
  containerClassName,
  containerStyle,
  textClassName,
  textStyle,
  label,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  loading = null,
}: Props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  return (
    <AnimatedPressable
      style={[animatedStyle, containerStyle]}
      className={containerClassName || ''}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 100 });
        onPressIn;
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 100 });
        onPressOut;
      }}
      disabled={disabled}
    >
      {!loading ? (
        <Text className={textClassName || ''} style={textStyle}>
          {label}
        </Text>
      ) : (
        <LoadingAnimated />
      )}
    </AnimatedPressable>
  );
};

export default Button;

const LoadingAnimated = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const values = [useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  useEffect(() => {
    const distance = 1;

    values.forEach((val, i) => {
      setInterval(() => {
        val.value = withTiming(distance, { duration: 250 }, () => {
          val.value = withTiming(0, { duration: 250 });
        });
      }, 800 + i * 150); // <- stagger each one
    });
  }, [values]);

  return (
    <Animated.View className="gap-1 flex-row">
      {values.map((val, i) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ translateY: val.value }],
        }));

        return (
          <Animated.View
            key={i}
            style={animatedStyle}
            entering={FadeInDown.delay(i * 100).duration(250)}
            exiting={FadeOutDown.delay(i * 100).duration(250)}
            className="p-1 bg-white rounded-full"
          />
        );
      })}
    </Animated.View>
  );
};
