import { View, TextInput, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import theme, { dark } from '../../data/color/theme';
import Button from '../../components/buttons/button1';
import otp from '../../api/auth/otp';
import useProfile from '../../store/useProfile';

const Otp = () => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean | null>(null);
  const isValid = code.length === 6;
  const email = useProfile.getState().email;
  useEffect(() => {
    const info = { email: email || '', code: parseInt(code, 10) };
    if (isValid) {
      console.log('Valid:', info);
      (async () => await otp.verify(info))();
    }
  }, [code, email, isValid]);
  return (
    <View
      className="h-full w-full items-center justify-center"
      style={{ backgroundColor: dark ? 'rgb(80,80,80)' : 'white' }}
    >
      <Text
        className="absolute top-10 text-2xl font-thin p-10 text-center"
        style={{ color: theme.text }}
      >
        Please Enter the One Time Code sent to your Email!
      </Text>
      <TextInput
        className={'w-[250px] h-fit py-5 text-xl border-[1px] rounded-2xl'}
        style={{
          borderColor:
            loading === true ? 'yellow' : loading === false ? 'red' : 'white',
          backgroundColor: 'rgba(192,194,201, 0.4)',
          color: theme.text,
        }}
        value={code}
        onChangeText={setCode}
        maxLength={6}
        textAlign={'center'}
        textAlignVertical={'center'}
        placeholder={'One Time Code'}
        keyboardType={'number-pad'}
      />
      <View className="flex-row p-4 items-center justify-center">
        <Text className="px-4 color-white">Didn't get the Email?</Text>
        <Button
          label="Resend"
          onPress={() => {}}
          textClassName="color-white"
          containerClassName="border-[1px] border-[rgba(200,200,200,0.4)] rounded px-5 py-2"
        />
      </View>
    </View>
  );
};

export default Otp;
