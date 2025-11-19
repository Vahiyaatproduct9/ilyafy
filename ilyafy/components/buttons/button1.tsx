import { useEffect } from 'react';
import { Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  EntryOrExitLayoutType,
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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
  entering?: EntryOrExitLayoutType;
  exiting?: EntryOrExitLayoutType;
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
  entering,
  exiting,
}: Props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  return (
    <AnimatedPressable
      entering={entering}
      exiting={exiting}
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
  return (
    <Animated.View className="gap-1 flex-row">
      {Array(3)
        .fill(null)
        .map((_, i) => {
          return <Bead i={i} key={i} />;
        })}
    </Animated.View>
  );
};

const Bead = ({ i }: { i: number }) => {
  const value = useSharedValue(0);
  useEffect(() => {
    const interval = setInterval(() => {
      value.value = withDelay(
        i * 100,
        withTiming(5, { duration: 250 }, () => {
          value.value = withTiming(0, { duration: 250 });
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [i, value]);
  const animate = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: value.value }],
    };
  });
  return (
    <Animated.View
      key={i}
      style={[
        animate,
        {
          borderRadius: 100,
          padding: 5,
          backgroundColor: 'rgba(255,255,255,0.6)',
        },
      ]}
      entering={FadeInDown.delay(i * 100).duration(250)}
      exiting={FadeOutDown.delay(i * 100).duration(250)}
    />
  );
};
