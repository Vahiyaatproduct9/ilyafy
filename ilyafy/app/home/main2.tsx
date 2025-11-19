import { View, Text, Dimensions } from 'react-native';
import React from 'react';
// import TrackPlayer from 'react-native-track-player'
const Main = () => {
  const width = Dimensions.get('window').width - 16;
  return (
    <View className="w-full bg-[rgba(33,33,78,0.38)]" style={{ width }}>
      <Text>Main</Text>
    </View>
  );
};

export default Main;
