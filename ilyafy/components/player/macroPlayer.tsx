import { View, Text, Dimensions } from 'react-native';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Icon from '../icons/icon';
import Play from '../../assets/icons/play.svg';
import Down from '../../assets/icons/down.svg';
import Pause from '../../assets/icons/pause.svg';
import Options from '../../assets/icons/options.svg';
import Next from '../../assets/icons/next.svg';
import Previous from '../../assets/icons/previous.svg';
import {
  Gesture,
  GestureDetector,
  GestureType,
  PanGesture,
} from 'react-native-gesture-handler';
import useCurrentTrack from '../../store/useCurrentTrack';
import TrackPlayer, { Track } from 'react-native-track-player';
import SongOptions from '../options/songOptions';
import control from '../../functions/stream/control';
import useDeviceSetting from '../../store/useDeviceSetting';
import useMessage from '../../store/useMessage';
import useSocketStore from '../../store/useSocketStore';
import {
  getDuration,
  getPosition,
} from '../../functions/miscellanous/getMinutes';

const MacroPlayer = (props: {
  sharedValue: SharedValue<number>;
  panGesture: PanGesture;
  refProp: RefObject<GestureType | undefined>;
}) => {
  const setMessage = useMessage(s => s.setMessage);
  const canBePlayed = useCurrentTrack(s => s.canBePlayed);
  const progressRef = useRef<GestureType | undefined>(undefined);
  const controlGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(progressRef)
    .withRef(props.refProp);
  const [optionsShown, setOptionsShown] = useState<Track | null>(null);
  const isPlaying = useCurrentTrack(s => s.isPlaying);
  const isConnected = useSocketStore(s => s.isConnected);
  const duration = useCurrentTrack(s => s.duration);
  const position = useCurrentTrack(s => s.position);
  const track = useCurrentTrack(s => s.track);
  const colors = useDeviceSetting(s => s.colors);
  async function togglePlay() {
    if (isPlaying) control.remotePause();
    else if (canBePlayed) await control.remotePlay();
    else setMessage('They are buffering, please wait!');
    const queue = await TrackPlayer.getQueue();
    console.log('Queue:', queue);
  }
  async function skipToNext() {
    await control.remoteSkip(
      ((await TrackPlayer.getActiveTrackIndex()) || 0) + 1,
      0,
    );
  }
  async function skipToPrevious() {
    await control.remoteSkip(
      ((await TrackPlayer.getActiveTrackIndex()) || 1) - 1,
      0,
    );
  }
  const { height, width } = Dimensions.get('window');

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        props.sharedValue.value,
        [80, height],
        [0.9, 1],
        Extrapolation.CLAMP,
      ),
      // display: translateY.value > height ? 'flex' : 'none',
      filter: [
        {
          brightness: interpolate(
            props.sharedValue.value,
            [80, height],
            [0.6, 1],
          ),
        },
      ],
    };
  });
  const thumbnailStyle = useAnimatedStyle(() => {
    const num = interpolate(
      props.sharedValue.value,
      [80, height],
      [width, width - 40],
    );
    return {
      width: num,
      height: num,
    };
  });

  const primaryColor = useSharedValue(colors.primary);
  useEffect(() => {
    primaryColor.value = withSpring(colors.primary, { duration: 1500 });
  }, [colors.primary, primaryColor]);
  const primaryColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: primaryColor.value,
    };
  });

  return (
    <Animated.View
      className={'absolute overflow-hidden'}
      style={[
        containerStyle,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
        },
        primaryColorStyle,
      ]}
    >
      <View className="w-full p-6 items-center flex-row">
        <Icon
          component={Down}
          size={30}
          onPress={() =>
            (props.sharedValue.value = withTiming(80, {
              duration: 800,
              easing: Easing.out(Easing.exp),
            }))
          }
          fill={colors.text}
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl" style={{ color: colors.text }}>
            Ilyafy
          </Text>
          <Text className="" style={{ color: colors.text }}>
            {isConnected ? 'Connection Mode' : 'Solo Mode'}
          </Text>
        </View>

        <Icon
          component={Options}
          onPress={() => setOptionsShown(track || null)}
          size={30}
          fill={colors.text}
        />
      </View>
      {optionsShown && (
        <SongOptions setSong={setOptionsShown} song={optionsShown} />
      )}
      <Animated.View
        style={primaryColorStyle}
        className="w-full gap-5 p-1 flex-1 items-center justify-center"
      >
        <Animated.Image
          source={
            track
              ? { uri: track?.artwork }
              : require('../../assets/images/background.png')
          }
          className="rounded-[32px]"
          style={[
            thumbnailStyle,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              aspectRatio: 1,
            },
          ]}
        />
        <GestureDetector gesture={controlGesture}>
          <Animated.View className="w-full p-2">
            <View className="w-full p-2 flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="font-semibold text-2xl"
                  style={{ color: colors.text }}
                >
                  {track?.title || 'Unknown Song'}
                </Text>
                <Text
                  className="text-xl font-thin"
                  style={{ color: colors.text }}
                >
                  {track?.artist || 'Unknown Artist'}
                </Text>
              </View>
              <View>
                <Text style={{ color: colors.text }}>
                  {`${getPosition(
                    position || 0,
                    duration || 0,
                  )}% of ${getDuration(duration || 0)}`}
                </Text>
              </View>
            </View>
            <ProgressBar refProp={progressRef} />
            <View className="flex-row p-2 w-full justify-center gap-10">
              <Icon
                component={Previous}
                size={40}
                fill="white"
                onPress={skipToPrevious}
                className="border-2 border-white p-2"
              />
              <Icon
                component={isPlaying ? Pause : Play}
                size={40}
                onPress={togglePlay}
                fill="white"
                className="border-2 border-white p-2"
              />
              <Icon
                component={Next}
                size={40}
                fill="white"
                onPress={skipToNext}
                className="border-2 border-white p-2"
              />
            </View>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Animated.View>
  );
};

export default MacroPlayer;

const ProgressBar = (props: {
  refProp: RefObject<GestureType | undefined>;
}) => {
  const { duration, position: tPosition } = useCurrentTrack();
  const { width } = Dimensions.get('window');

  const position = useSharedValue(0);
  useEffect(() => {
    let percentage = (tPosition || 0) / (duration || 1);
    position.value = withTiming(percentage * (width - 16), { duration: 1000 });
  }, [duration, position, tPosition, width]);
  const seekSongTo = (i: number) => {
    control.remoteSeek(i);
    console.log('Song Seeked!');
  };
  const gestureHandler = Gesture.Pan()
    .onUpdate(e => {
      position.value = e.absoluteX;
    })
    .onEnd(e => {
      let pos;
      if (e.absoluteX < 8) pos = 0;
      else if (e.absoluteX > width - 8) pos = duration || 0;
      else pos = e.absoluteX;
      const percentage = pos / (width - 16);

      const progress = percentage * (duration || 0);
      runOnJS(seekSongTo)(progress);
    })
    .withRef(props.refProp);
  const gestureTapHandler = Gesture.Tap().onBegin(async e => {
    position.value = withSpring(e.absoluteX);
    let pos;
    if (e.absoluteX < 8) pos = 0;
    else if (e.absoluteX > width - 8) pos = duration || 0;
    else pos = e.absoluteX;
    const percentage = pos / (width - 16);
    const progress = percentage * (duration || 0);
    runOnJS(seekSongTo)(progress);
  });
  const combined = Gesture.Simultaneous(gestureHandler, gestureTapHandler);
  const colors = useDeviceSetting(s => s.colors);
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
          style={{ backgroundColor: colors.secondary }}
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
