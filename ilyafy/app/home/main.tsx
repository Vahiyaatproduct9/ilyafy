import '../../global.css';
import { View, Text, Pressable } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import TrackPlayer, { Event, State } from 'react-native-track-player';
// import saveAndStream from '../../functions/saveAndStream';
const Main = () => {
  return (
    <View className="bg-slate-500 items-center flex-1 justify-center">
      <Text className="text-3xl font-bold text-blue-200">Welcome!</Text>
    </View>
  );

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
};

export default Main;
