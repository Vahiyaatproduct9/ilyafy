import '../../global.css';
import { View, Text, Pressable } from 'react-native';
import React from 'react';
import TrackPlayer, { State } from 'react-native-track-player';
const Main = () => {
  const handlePay = async () => {
    if ((await TrackPlayer.getPlaybackState()).state === State.Playing)
      await TrackPlayer.pause();
    else await TrackPlayer.play();
  };
  return (
    <View className="bg-white items-center flex-1 justify-center">
      <Text className="text-3xl font-bold text-blue-500">
        Welcome to Ilyafy!
        <Pressable onPress={handlePay}>
          <Text>Play</Text>
        </Pressable>
      </Text>
    </View>
  );
};

export default Main;
