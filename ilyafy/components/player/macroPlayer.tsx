import { View, Text, Dimensions } from 'react-native';
import React, { RefObject, useEffect, useRef } from 'react';
import Animated, {
  AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import theme from '../../data/color/theme';
import { Image } from 'react-native';
import Icon from '../icons/icon';
import Play from '../../assets/icons/play.svg';
// import Pause from '../../assets/icons/pause.svg';
import Next from '../../assets/icons/next.svg';
import Previous from '../../assets/icons/previous.svg';
// import Playlist from '../../assets/icons/playlist.svg';
import {
  Gesture,
  GestureDetector,
  GestureType,
  PanGesture,
} from 'react-native-gesture-handler';
import useCurrentTrack from '../../store/useCurrentTrack';
import TrackPlayer from 'react-native-track-player';

const MacroPlayer = (props: {
  style?: AnimatedStyle;
  panGesture: PanGesture;
  refProp: RefObject<GestureType | undefined>;
}) => {
  const { width } = Dimensions.get('screen');
  const progressRef = useRef<GestureType | undefined>(undefined);
  const controlGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(progressRef)
    .withRef(props.refProp);
  const { track, position } = useCurrentTrack();
  const setSong = async () => {
    await TrackPlayer.reset().then(async () => {
      await TrackPlayer.add({
        url: require('../../data/test.mp3'),
        title: "I couldn't care less",
        artist: 'Daniel Caesar',
        artwork: require('../../data/test.png'),
      }).then(async () => {
        await TrackPlayer.play();
        const player = await TrackPlayer.setRate(1);
        console.log('player:', player);
      });
    });
  };

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
          {position || 'lol'}
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
        <GestureDetector gesture={controlGesture}>
          <Animated.View className="w-full p-2">
            <View className="w-full p-2">
              <Text
                className="font-semibold text-2xl"
                style={{ color: theme.text }}
              >
                {track?.title || 'Unknown Song'}
              </Text>
              <Text className="text-xl font-thin" style={{ color: theme.text }}>
                {track?.artist || 'Unknown Artist'}
              </Text>
            </View>
            <ProgressBar refProp={progressRef} />
            <View className="flex-row p-2 w-full justify-center gap-10">
              <Icon
                component={Previous}
                size={40}
                fill="white"
                className="border-2 border-white p-2"
              />
              <Icon
                component={Play}
                size={40}
                onPress={setSong}
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
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
};

export default MacroPlayer;

const ProgressBar = (props: {
  refProp: RefObject<GestureType | undefined>;
}) => {
  const position = useSharedValue(0);
  const gestureHandler = Gesture.Pan()
    .onUpdate(e => {
      position.value = e.x;
      console.log('data: ', e.x);
    })
    .withRef(props.refProp);
  const gestureTapHandler = Gesture.Tap().onBegin(e => {
    position.value = withSpring(e.absoluteX);
  });
  const combined = Gesture.Simultaneous(gestureHandler, gestureTapHandler);
  const rProgressStyle = useAnimatedStyle(() => {
    return {
      width: position.value,
    };
  });
  return (
    <GestureDetector gesture={combined}>
      <Animated.View className={'h-4 w-full'}>
        <Animated.View
          className="h-2 w-full rounded-xl overflow-hidden"
          style={{ backgroundColor: theme.secondary }}
        >
          <Animated.View
            className={'bg-slate-600 flex-1 p-1 rounded-xl'}
            style={[rProgressStyle]}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
