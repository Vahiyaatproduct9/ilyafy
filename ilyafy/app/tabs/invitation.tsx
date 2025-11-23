import { View, Text, Dimensions, TextInput } from 'react-native';
import React, { useState } from 'react';
import theme from '../../data/color/theme';
import Button from '../../components/buttons/button1';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import connect from '../../functions/auth/connect';
import useMessage from '../../store/useMessage';
import useProfile from '../../store/useProfile';
import refreshProfile from '../../api/auth/refreshProfile';

const Invitation = () => {
  const width = Dimensions.get('window').width - 16;
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean | null>(null);
  const profile = useProfile.getState().profile;
  const setProfile = useProfile.getState().setProfile;
  const showButton = value.length > 3;
  const setMessage = useMessage().setMessage;
  async function Connect() {
    setLoading(true);
    const response = await connect(value);
    if (response?.success) {
      setLoading(null);
      setProfile({
        name: profile?.name || '',
        id: profile?.id || '',
        email: profile?.email || '',
        room_part_of: response?.id || '',
      });
    } else setLoading(false);
    console.log('response:', response);
    setMessage(response?.message || '');
  }
  const reload = async () => {
    const response = await refreshProfile();
    if (response.success) {
      setProfile(response.user);
    } else {
      setMessage('Some Error Occured :(');
    }
  };
  return (
    <View
      className="flex-1 h-full items-center justify-center p-5"
      style={{ width, backgroundColor: theme.background }}
    >
      <Text
        className="absolute self-center top-10 font-light text-2xl"
        style={{ color: theme.text }}
      >
        Who do you wanna pair up with?
      </Text>
      <Button
        label="Reload"
        containerClassName="border-2 rounded-2xl px-6 py-3 border-white"
        onPress={reload}
        textStyle={{
          color: theme.text,
        }}
      />
      <Text
        className="mt-2 text-xl font-semibold"
        style={{ color: theme.text }}
      >
        Enter their Email here!
      </Text>
      <TextInput
        className="border-2 min-w-24 rounded-2xl py-2 px-5 text-xl"
        style={{ color: theme.text, borderColor: theme.primary }}
        textAlign="center"
        textAlignVertical="center"
        keyboardType="email-address"
        returnKeyType="search"
        selectionColor={'pink'}
        value={value}
        onChangeText={setValue}
      />
      {showButton && (
        <Button
          label="Look"
          onPress={Connect}
          loading={loading}
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(250)}
          containerClassName="self-end px-10 py-2 rounded-xl"
          containerStyle={{
            backgroundColor: theme.primary,
          }}
          textClassName="text-2xl"
          textStyle={{ color: theme.text }}
        />
      )}
    </View>
  );
};

export default Invitation;
