import { View, Text, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Button from '../buttons/button1';
import useConfirmScreen from '../../store/useConfirmScreen';

const ConfirmScreen = () => {
  const cS = useConfirmScreen();
  const [loading, setLoading] = useState<boolean>(false);
  const flicker = useSharedValue(1);
  const flickerAnimation = useAnimatedStyle(() => {
    return {
      opacity: flicker.value,
    };
  });
  const execYes = async () => {
    setLoading(true);
    const fun = cS?.data?.yesFunction;
    fun && (await fun());
    setLoading(false);
    cS.setVisible(false);
  };
  const execNo = async () => {
    const fun = cS?.data?.noFunction;
    fun && (await fun());
    cS.setVisible(false);
  };
  const { width, height } = Dimensions.get('screen');
  useEffect(() => {
    const interval = setInterval(() => {
      flicker.value = withTiming(0.8, { duration: 250 }, () => {
        flicker.value = withTiming(1, { duration: 250 });
      });
    }, 500);
    return () => clearInterval(interval);
  });
  return (
    <Animated.View
      entering={FadeIn.duration(800)}
      exiting={FadeOut.duration(800)}
      className="absolute top-0 left-0
      bg-[rgba(0,0,0,0.3)] z-50 items-center justify-center"
      style={{
        height,
        width,
      }}
    >
      <Animated.View
        className={
          'bg-[rgba(255,255,255,1)] min-w-[60%] max-w-[80%] p-3 rounded'
        }
      >
        <View className="w-full items-start">
          <Text className="color-black font-bold">
            {cS?.data?.title || 'Are you sure?'}
          </Text>
        </View>
        <View className="w-full items-center">
          <Text className="color-[rgba(0,0,0,0.5)]">
            {cS?.data?.body || 'This action is irreversible'}
          </Text>
        </View>
        <View className="justify-around pt-4 items-start gap-2 align-center">
          <Button
            containerClassName="items-center p-3 justify-center rounded-l-xl rounded-r-3xl bg-red-600 w-[60%]"
            label={cS?.data?.yesLabel || 'Yes'}
            textClassName="font-bold
            color-white"
            loading={loading}
            onPress={execYes}
            containerStyle={
              cS?.data?.critical === 'yes' ? flickerAnimation : {}
            }
          />
          {/* <Animated.View className={'w-full'}>
          </Animated.View> */}
          <Button
            containerClassName="items-center rounded-xl bg-[rgba(100,100,100,0.7)] p-3 justify-center w-full"
            label={cS?.data?.noLabel || 'No'}
            textClassName="font-bold
            color-white"
            onPress={execNo}
            containerStyle={cS?.data?.critical === 'no' ? flickerAnimation : {}}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default ConfirmScreen;
