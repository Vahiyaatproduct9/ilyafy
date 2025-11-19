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
// import React, { useEffect, useState } from 'react';
// import TrackPlayer, { Event, State } from 'react-native-track-player';
// import saveAndStream from '../../functions/saveAndStream';
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
  return (
    // <View className="bg-slate-500 items-center flex-1">
    // {/* <Text className="text-3xl font-bold text-blue-200">Heyy</Text> */}
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
      <Invitation />
      <Main2 />
    </Animated.ScrollView>
  );
};

//   const sendMsg = async () => {
//     // await TrackPlayer.add({
//     //   id: 'placeholder',
//     //   // url: require('../../data/test.mp3'),
//     //   url: 'file:///data/user/0/com.ilyafy/cache/1762842829597.aac',
//     //   title: 'Always',
//     //   artist: 'Daniel Caesar',
//     //   artwork: require('../../data/test.png'),
//     // });
//     const task = await saveAndStream(
//       'https://youtu.be/jfjXJpUNayg?si=zGVN9eKvt1CntJMh',
//       // 'https://youtu.be/Eicw_dIi2dw?si=RfCTdEDpY83gfUpf',
//       // 'https://youtu.be/rScwLoES2bM?si=YOSMQyhVGQtpKnk1',
//       // 'https://youtu.be/xnP7qKxwzjg?si=kbOCKZEELlctlZZe',
//     );
//     const path = task?.localPath;
//     const headers = task?.headers;
//     const metadata = task?.metadata;
//     const isStreamed =
//       path?.startsWith('https://') || path?.startsWith('http://') || false;
//     console.log('task: ', task);
//     if (path) {
//       await TrackPlayer.add({
//         id: `${(await TrackPlayer.getQueue()).length + 1}`,
//         url: isStreamed ? path : `file://${path}`,
//         title: isStreamed
//           ? metadata?.title
//           : headers['X-Track-Title'] || 'Streamed Audio',
//         artist: isStreamed
//           ? metadata?.artist
//           : headers['X-Track-Artist'] || 'Ilyafy',
//         artwork: isStreamed
//           ? metadata?.thumbnail
//           : headers['X-Track-Thumb'] || require('../../data/test.png'),
//         duration: isStreamed
//           ? metadata?.duration
//           : parseInt(headers['X-Duration'], 10) || undefined,
//       });
//       await TrackPlayer.play();
//     }
//     const queue = await TrackPlayer.getQueue();
//     console.log({ queue });
//   };
//   const [message, setMessage] = useState<string>('Download Audio');
//   useEffect(() => {
//     TrackPlayer.addEventListener(Event.PlaybackState, state => {
//       if (state.state === State.Buffering || state.state === State.Loading) {
//         setMessage('buffering...');
//       } else {
//         setMessage('Loaded');
//       }
//     });
//   }, []);
//   return (
//     <View className="bg-slate-500 items-center flex-1 justify-center">
//       <Text className="text-3xl font-bold text-blue-200">Welcome!</Text>
//       <Pressable
//         className="bg-slate-400 py-3 px-10 rounded-xl"
//         onPress={sendMsg}
//       >
//         <Text className="font-semibold text-xl color-blue-300">{message}</Text>
//       </Pressable>
//     </View>
//   );
