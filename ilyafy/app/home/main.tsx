import Animated, {
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  View,
  Text,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Main2 from './main2';
import theme from '../../data/color/theme';
import Button from '../../components/buttons/button1';
import Playlist from '../tabs/playlist';
import Invitation from '../tabs/invitation';
import { RefObject, useRef } from 'react';
import { AnimatedScrollView } from 'react-native-reanimated/lib/typescript/component/ScrollView';
import Connection from '../tabs/connection';
import useProfile from '../../store/useProfile';
const tabButtons = ['Playlist', 'Pair', 'Main'];
const Main = () => {
  const scrollRef = useRef<AnimatedScrollView | null>(null);
  const width = Dimensions.get('window').width - 16;
  const scrollX = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: e => {
      scrollX.value = e.contentOffset.x;
    },
  });
  function changeTab(i: number) {
    scrollRef.current?.scrollTo({
      x: i * width,
      animated: true,
    });
  }
  return (
    <View
      className="h-full w-full p-2 gap-1"
      style={{ backgroundColor: theme.background }}
    >
      <View className="w-full flex-row item-center justify-between">
        <Text style={{ color: theme.text }} className="font-bold text-3xl">
          Ilyafy
        </Text>
        <Text className="text-2xl" style={{ color: theme.text }}>
          Just Music & Us
        </Text>
      </View>
      <View
        className="w-full p-2 rounded-2xl flex-row gap-3 justify-center"
        style={{ backgroundColor: theme.secondary }}
      >
        {tabButtons.map((item, i) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const tabStyle = useAnimatedStyle(() => {
            const backgroundColor = interpolateColor(
              scrollX.value,
              [(i - 1) * width, i * width, (i + 1) * width],
              [theme.background, theme.primary, theme.background],
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
                color: theme.text,
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
      />
    </View>
  );
};

export default Main;

type ScrollViewProps = {
  width: number;
  scrollHandler: (arg: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollRef: RefObject<AnimatedScrollView | null>;
};

const ScrollView = ({ scrollRef, width, scrollHandler }: ScrollViewProps) => {
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
      className={'rounded-2xl mt-4'}
    >
      <Playlist />
      {room_part_of && room_part_of.length !== 0 ? (
        <Connection />
      ) : (
        <Invitation />
      )}
      <Main2 />
    </Animated.ScrollView>
  );
};
