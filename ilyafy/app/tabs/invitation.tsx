import { View, Text, Dimensions, TextInput } from 'react-native';
import React, { useState } from 'react';
import Button from '../../components/buttons/button1';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import connect from '../../functions/partner/connect';
import useMessage from '../../store/useMessage';
import useProfile from '../../store/useProfile';
import refreshProfile from '../../api/auth/refreshProfile';
import useDeviceSetting from '../../store/useDeviceSetting';

const Invitation = () => {
  const width = Dimensions.get('window').width - 16;
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean | null>(null);
  const setProfile = useProfile().setProfile;
  const showButton = value.length > 3;
  const setMessage = useMessage().setMessage;
  const colors = useDeviceSetting(s => s.colors);
  async function Connect() {
    setLoading(true);
    const response = await connect(value);
    if (response?.success) setLoading(null);
    else setLoading(false);
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
      className="flex-1 h-full p-5"
      style={{ width, backgroundColor: colors.background }}
    >
      <Text
        className="self-center mt-10 font-light text-2xl"
        style={{ color: colors.text }}
      >
        Who do you wanna pair up with?
      </Text>
      <TextInput
        className="border-2 min-w-24 my-5 rounded-2xl py-2 px-5 text-xl"
        style={{ color: colors.text, borderColor: colors.primary }}
        textAlign="center"
        placeholder="someone@example.com"
        placeholderTextColor={'rgba(255,255,255,0.4)'}
        textAlignVertical="center"
        keyboardType="email-address"
        returnKeyType="search"
        selectionColor={'pink'}
        value={value}
        onChangeText={setValue}
      />
      <Button
        label="Look"
        onPress={Connect}
        loading={loading}
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(250)}
        containerClassName="self-end px-10 py-2 rounded-xl"
        // eslint-disable-next-line react-native/no-inline-styles
        containerStyle={{
          backgroundColor: colors.primary,
          opacity: showButton ? 1 : 0.4,
        }}
        disabled={!showButton}
        textClassName="text-xl"
        textStyle={{ color: colors.text }}
      />
    </View>
  );
};

export default Invitation;
