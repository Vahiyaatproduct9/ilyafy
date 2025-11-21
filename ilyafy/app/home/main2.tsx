import { View, Text, Dimensions } from 'react-native';
import React, { useState } from 'react';
import Button from '../../components/buttons/button1';
import useSocketStore, { commandEmitter } from '../../store/useSocketStore';
import useProfile from '../../store/useProfile';
// import TrackPlayer from 'react-native-track-player'
const Main = () => {
  const width = Dimensions.get('window').width - 16;
  const [loading, setLoading] = useState<boolean | null>(null);
  const profile = useProfile.getState().profile;
  const roomId = profile?.room_part_of;
  const connect = useSocketStore().connect;
  const Connect = async () => {
    setLoading(true);
    connect();
    setLoading(null);
    commandEmitter.on('reject', () => {
      setLoading(false);
    });
  };
  return (
    <View className="w-full bg-[rgba(33,33,78,0.38)]" style={{ width }}>
      {roomId && (
        <Button
          label="Connect to Room!"
          loading={loading}
          containerClassName="rounded-2xl px-6 py-4 border-2 border-white"
          onPress={Connect}
        />
      )}
    </View>
  );
};

export default Main;
