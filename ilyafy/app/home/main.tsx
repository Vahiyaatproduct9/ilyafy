import '../../global.css';
import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import TrackPlayer, { Event, State } from 'react-native-track-player';
import saveAndStream from '../../functions/saveAndStream';
const Main = () => {
  const sendMsg = async () => {
    // await TrackPlayer.add({
    //   id: 'placeholder',
    //   url: 'file:///data/user/0/com.ilyafy/cache/1761797489062.aac',
    //   title: 'Always',
    //   artist: 'Daniel Caesar',
    //   artwork: require('../../data/test.png'),
    // });
    const task = await saveAndStream(
      'https://youtu.be/pOS3vCY-4kw?si=kaY3QiqyJMRbevDv',
      // 'https://youtu.be/rScwLoES2bM?si=YOSMQyhVGQtpKnk1',
      // 'https://youtu.be/xnP7qKxwzjg?si=kbOCKZEELlctlZZe',
    );
    const path = task?.localPath;
    const headers = task?.headers;
    console.log('task: ', task);
    if (path) {
      await TrackPlayer.add({
        id: `${(await TrackPlayer.getQueue()).length + 1}`,
        url: `file://${path}`,
        title: headers['X-Track-Title'] || 'Streamed Audio',
        artist: headers['X-Track-Artist'] || 'Ilya',
        artwork: headers['X-Track-Thumbnail'] || require('../../data/test.png'),
        duration: parseInt(headers['X-Duration'], 10) || undefined,
      });
      await TrackPlayer.play();
    }
    const queue = await TrackPlayer.getQueue();
    console.log({ queue });
  };
  const [message, setMessage] = useState<string>('Send');
  useEffect(() => {
    TrackPlayer.addEventListener(Event.PlaybackState, state => {
      if (state.state === State.Buffering || state.state === State.Loading) {
        setMessage('Loading..');
      } else {
        setMessage('Download');
      }
    });
  }, []);
  return (
    <View className="bg-slate-500 items-center flex-1 justify-center">
      <Text className="text-3xl font-bold text-blue-200">
        Welcome to Ilyafy!
      </Text>
      <Pressable
        className="bg-slate-400 py-3 px-10 rounded-xl"
        onPress={sendMsg}
      >
        <Text className="font-semibold text-xl color-blue-300">{message}</Text>
      </Pressable>
    </View>
  );
};

export default Main;
