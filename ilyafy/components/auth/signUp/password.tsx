/* eslint-disable react-native/no-inline-styles */
import { View, TextInput } from 'react-native';
import React, { Dispatch, SetStateAction } from 'react';
// import Animated from 'react-native-reanimated';
import Button from '../../buttons/button1';
import theme from '../../../data/color/theme';
// import useMessage from '../../../store/useMessage';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';

type PasswordProps = {
  pass: string;
  setPass: Dispatch<SetStateAction<string>>;
  confirmPass: string;
  setConfirmPass: Dispatch<SetStateAction<string>>;
  onPress: () => Promise<void>;
  loading: boolean | null;
};

const Password = ({
  pass,
  setPass,
  confirmPass,
  setConfirmPass,
  onPress,
  loading,
}: PasswordProps) => {
  // const { setMessage } = useMessage();
  const unmatchedPass =
    confirmPass.length < 8 || pass.length < 8 || pass !== confirmPass;
  return (
    <View className="gap-2">
      <TextInput
        className={'flex-1 w-[300px] px-2 text-l border-[1px] rounded-2xl'}
        style={{
          backgroundColor: 'rgba(192,194,201, 0.4)',
          borderColor: pass.length > 1 && unmatchedPass ? 'red' : 'white',
        }}
        textAlign={'center'}
        textAlignVertical={'center'}
        placeholder={'Password'}
        keyboardAppearance={'dark'}
        secureTextEntry
        textContentType={'password'}
        returnKeyType={'done'}
        value={pass}
        onChangeText={setPass}
      />
      {pass.length > 5 && confirmPass.length > 5 && pass !== confirmPass && (
        <Animated.Text
          entering={FadeInRight.duration(250)}
          exiting={FadeOutRight.duration(250)}
          className={'font-semibold text-sm self-end'}
          style={{ color: theme.text }}
        >
          Passwords do not Match :(
        </Animated.Text>
      )}
      {confirmPass.length > 1 &&
        pass.length > 1 &&
        (confirmPass.length < 8 || pass.length < 8) && (
          <Animated.Text
            entering={FadeInRight.duration(250)}
            exiting={FadeOutRight.duration(250)}
            className={'font-semibold text-sm self-end'}
            style={{ color: theme.text }}
          >
            Password must be longer than 8 chars!
          </Animated.Text>
        )}
      <TextInput
        className={
          'flex-1 w-[300px] px-2 text-l border-white border-[1px] rounded-2xl'
        }
        style={{
          backgroundColor: 'rgba(192,194,201, 0.4)',
        }}
        textAlign={'center'}
        textAlignVertical={'center'}
        placeholder={'Confirm Password'}
        keyboardAppearance={'dark'}
        secureTextEntry
        textContentType={'password'}
        returnKeyType={'done'}
        value={confirmPass}
        onChangeText={setConfirmPass}
      />
      <Button
        label="GO"
        containerClassName="rounded-2xl justify-center items-center p-4"
        containerStyle={{
          opacity: unmatchedPass ? 0.4 : 1,
          backgroundColor: theme.primary,
          borderRadius: 16,
          marginTop: 14,
        }}
        loading={loading}
        textStyle={{
          color: theme.text,
        }}
        textClassName="font-bold text-xl"
        disabled={unmatchedPass}
        onPress={onPress}
      />
    </View>
  );
};

export default Password;
