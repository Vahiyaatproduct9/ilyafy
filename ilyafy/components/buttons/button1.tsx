import { Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, {
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
      <Text className={textClassName || ''} style={textStyle}>
        {label}
      </Text>
    </AnimatedPressable>
  );
};

export default Button;
