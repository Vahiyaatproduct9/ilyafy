import { View, Text, Dimensions } from 'react-native';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import theme from '../../data/color/theme';
import Icon from '../icons/icon';
import Play from '../../assets/icons/play.svg';
import Down from '../../assets/icons/down.svg';
// import Pause from '../../assets/icons/pause.svg';
import Options from '../../assets/icons/options.svg';
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
import TrackPlayer, { Event } from 'react-native-track-player';
import SongOptions from '../options/songOptions';

const MacroPlayer = (props: {
  sharedValue: SharedValue<number>;
  panGesture: PanGesture;
  refProp: RefObject<GestureType | undefined>;
}) => {
  const progressRef = useRef<GestureType | undefined>(undefined);
  const controlGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(progressRef)
    .withRef(props.refProp);
  const [optionsShown, setOptionsShown] = useState<string | null>(null);
  const { track, position } = useCurrentTrack();
  const setSong = async () => {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      url: require('../../data/test.mp3'),
      title: 'Always',
      artist: 'Daniel Caesar',
      artwork: require('../../data/test.png'),
    });
    await TrackPlayer.play();
  };
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

  const functionList = [
    {
      title: 'function 1',
      func: () => {
        console.log('Do Something!');
      },
    },
    {
      title: 'function 2',
      func: () => {
        console.log('Do some other thing!');
      },
    },
  ];
  return (
    <Animated.View
      className={'absolute overflow-hidden'}
      style={[
        containerStyle,
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
      <View className="w-full p-6 items-center flex-row">
        <Icon
          component={Down}
          size={30}
          // onPress={() => console.log('Heyy')}
          fill={theme.text}
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl" style={{ color: theme.text }}>
            Ilyafy
          </Text>
          <Text className="" style={{ color: theme.text }}>
            Connection Mode
          </Text>
        </View>

        <Icon
          component={Options}
          onPress={() => setOptionsShown('some string')}
          size={30}
          fill={theme.text}
        />
      </View>
      {optionsShown && (
        <SongOptions
          i="ss"
          setOptions={setOptionsShown}
          functionList={functionList}
          song={undefined}
        />
      )}
      <View className="w-full gap-5 p-1 flex-1 items-center justify-center">
        <Animated.Image
          source={require('../../assets/images/background.png')}
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
  const { duration, position: tPosition } = useCurrentTrack();
  const { width } = Dimensions.get('window');

  const position = useSharedValue(0);
  useEffect(() => {
    let percentage = (tPosition || 0) / (duration || 1);
    position.value = withTiming(percentage * (width - 16), { duration: 1000 });
  }, [duration, position, tPosition, width]);
  const seekSongTo = async (i: number) => {
    await TrackPlayer.seekTo(i);
    console.log('Song Seeked!');
  };
  const gestureHandler = Gesture.Pan()
    .onUpdate(e => {
      console.log('data: ', e.x);
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
