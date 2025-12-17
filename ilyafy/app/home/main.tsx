import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  View,
  Text,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from 'react-native';
import Main2 from './main2';
import Button from '../../components/buttons/button1';
import Playlist from '../tabs/playlist';
import Invitation from '../tabs/invitation';
import { RefObject, useEffect, useRef } from 'react';
import { AnimatedScrollView } from 'react-native-reanimated/lib/typescript/component/ScrollView';
import Connection from '../tabs/connection';
import useProfile from '../../store/useProfile';
import React from 'react';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  GestureType,
} from 'react-native-gesture-handler';
import MiniPlayer from '../../components/player/miniPlayer';
import MacroPlayer from '../../components/player/macroPlayer';
import useDeviceSetting from '../../store/useDeviceSetting';
import SongOptions from '../../components/options/songOptions';
import { Track } from 'react-native-track-player';
const tabButtons = ['Playlist', 'Pair', 'Main'];
const Main = () => {
  const colors = useDeviceSetting(s => s.colors);
  const parentRef = useRef<GestureType | undefined>(undefined);
  const controlRef = useRef<GestureType | undefined>(undefined);
  const scrollRef = useRef<AnimatedScrollView | null>(null);
  const [selectedSong, setSong] = React.useState<Track | null>(null);
  const width = Dimensions.get('window').width - 16;
  const height = Dimensions.get('window').height;
  const scrollX = useSharedValue(80);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: e => {
      scrollX.value = e.contentOffset.x;
    },
  });
  const AP = Animated.createAnimatedComponent(Pressable);
  const translateY = useSharedValue(0);
  function changeTab(i: number) {
    scrollRef.current?.scrollTo({
      x: i * width,
      animated: true,
    });
  }

  const panGesture = Gesture.Pan()
    .onUpdate(e => {
      translateY.value = withSpring(-e.translationY + translateY.value, {
        damping: 1000,
      });
    })
    .withRef(parentRef)
    .requireExternalGestureToFail(controlRef)
    .onEnd(e => {
      if (e.translationY < -180 || e.velocityY < -500) {
        translateY.value = withSpring(height, { damping: 1000 });
      } else {
        translateY.value = withSpring(80, { damping: 200 });
      }
    });

  const playerAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(translateY.value, [80, height], [80, height + 40]),
      borderRadius: interpolate(translateY.value, [80, height], [24, 0]),
      bottom: interpolate(translateY.value, [80, height], [10, 0]),
      width: interpolate(translateY.value, [80, height], [width, width + 16]),
    };
  });
  const microPlayer = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateY.value,
        [80, height],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      display: translateY.value < height ? 'flex' : 'none',
    };
  });
  const primaryColor = useSharedValue(colors.primary);
  useEffect(() => {
    primaryColor.value = withSpring(colors.primary, { damping: 1000 });
  }, [colors.primary, primaryColor]);
  const primaryColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: primaryColor.value,
    };
  });
  return (
    <Animated.View
      className="h-full w-full p-2 gap-1"
      style={primaryColorStyle}
    >
      <View className="w-full flex-row item-center justify-between">
        <Text style={{ color: colors.text }} className="font-bold text-3xl">
          Ilyafy
        </Text>
        <Text className="text-2xl" style={{ color: colors.text }}>
          Just Music & Us
        </Text>
      </View>
      <View
        className="w-full p-2 rounded-2xl flex-row gap-3 justify-center"
        style={{ backgroundColor: colors.secondary }}
      >
        {tabButtons.map((item, i) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const tabStyle = useAnimatedStyle(() => {
            const backgroundColor = interpolateColor(
              scrollX.value,
              [(i - 1) * width, i * width, (i + 1) * width],
              [colors.background, colors.primary, colors.background],
            );
            return { backgroundColor };
          });
          return (
            <Button
              onPress={() => changeTab(i)}
              key={i}
              containerStyle={tabStyle}
              containerClassName="min-w-28 rounded-2xl flex-1 justify-center items-center p-3"
              textStyle={{
                color: colors.text,
              }}
              label={item}
            />
          );
        })}
      </View>
      <ScrollView
        scrollRef={scrollRef}
        width={width}
        scrollHandler={scrollHandler}
        setSong={setSong}
      />

      <Animated.View
        style={[
          playerAnimation,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowColor: '#000000',
          },
        ]}
        className={'z-10 absolute self-center overflow-hidden'}
      >
        <GestureHandlerRootView>
          <GestureDetector gesture={panGesture}>
            <AP
              onPress={() => (translateY.value = withSpring(height))}
              className={'flex-1 bg-red-600'}
            >
              <MacroPlayer
                refProp={controlRef}
                panGesture={panGesture}
                sharedValue={translateY}
              />
              <MiniPlayer style={microPlayer} />
            </AP>
          </GestureDetector>
        </GestureHandlerRootView>
      </Animated.View>
      {selectedSong && <SongOptions song={selectedSong} setSong={setSong} />}
    </Animated.View>
  );
};

export default Main;

type ScrollViewProps = {
  width: number;
  scrollHandler: (arg: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollRef: RefObject<AnimatedScrollView | null>;
  setSong: React.Dispatch<React.SetStateAction<Track | null>>;
};

const ScrollView = ({
  scrollRef,
  width,
  scrollHandler,
  setSong,
}: ScrollViewProps) => {
  const room_part_of = useProfile().profile?.room_part_of;
  return (
    <Animated.ScrollView
      horizontal
      ref={scrollRef}
      showsHorizontalScrollIndicator={false}
      snapToInterval={width}
      decelerationRate={'fast'}
      bounces={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      pagingEnabled
      className={'rounded-[28px] mt-4'}
    >
      <Playlist setSong={setSong} />
      {room_part_of && room_part_of.length !== 0 ? (
        <Connection />
      ) : (
        <Invitation />
      )}
      <Main2 />
    </Animated.ScrollView>
  );
};
