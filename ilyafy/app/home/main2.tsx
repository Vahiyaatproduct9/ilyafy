import { View, Dimensions } from 'react-native';
import React from 'react';
import Button from '../../components/buttons/button1';
import useProfile from '../../store/useProfile';
import theme from '../../data/color/theme';
import { TextInput } from 'react-native';
import useBackend from '../../store/useBackend';
const Main = () => {
  const width = Dimensions.get('window').width - 16;
  const setProfile = useProfile?.getState()?.setProfile;
  const { setBackend, backend } = useBackend();
  const signOut = () => {
    setProfile(null);
  };
  const signOutButton = () => {
    return (
      <Button
        label="Sign Out"
        containerClassName="rounded-2xl items-center w-max-[80%] justify-center px-6 py-4 border-2 border-white"
        textStyle={{
          color: theme.text,
        }}
        onPress={signOut}
      />
    );
  };

  return (
    <View
      className="w-full bg-[rgba(33,33,78,0.38)] gap-4 items-center"
      style={{ width }}
    >
      <View className="w-full p-3 flex-row gap-2 justify-end">
        {signOutButton()}
      </View>
      <View className="flex-1 w-full">
        <TextInput
          value={backend || ''}
          onChangeText={setBackend}
          className="border-2 rounded-2xl px-2 font-thin text-xl color-white border-white"
          placeholder="Enter backend url"
        />
      </View>
    </View>
  );
};

export default Main;
