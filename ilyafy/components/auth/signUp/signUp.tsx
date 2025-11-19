/* eslint-disable react-native/no-inline-styles */
import { TextInput } from 'react-native';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
} from 'react-native-reanimated';
import Button from '../../buttons/button1';
import theme from '../../../data/color/theme';
import Password from './password';
import { ViewProps } from 'react-native';
import { authMethod } from '../../../types/components';
import signup from '../../../api/auth/signup';
import useProfile from '../../../store/useProfile';
import { useNavigation } from '@react-navigation/native';
import useMessage from '../../../store/useMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';
type props = {
  setAuth: Dispatch<SetStateAction<authMethod>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
};
type signUpProp = {
  style?: ViewProps | AnimationEvent;
  whichAuth: authMethod;
  setAuth: Dispatch<SetStateAction<authMethod>>;
};

const Main = ({ setAuth, email, setEmail }: props) => {
  const unmatchedEmail =
    email.length > 0 && (!email.includes('@') || !email.includes('.'));
  const SE = useProfile().setEmail;
  return (
    <Animated.View
      entering={FadeInRight.duration(250)}
      exiting={FadeOutLeft.duration(250)}
    >
      <TextInput
        className={'flex-1 w-[300px] px-2 text-l border-[1px] rounded-2xl'}
        style={{
          borderColor: unmatchedEmail ? 'red' : 'white',
          backgroundColor: 'rgba(192,194,201, 0.4)',
          color: theme.text,
        }}
        textAlign={'center'}
        textAlignVertical={'center'}
        placeholder={'Email'}
        keyboardType={'email-address'}
        value={email}
        onChangeText={setEmail}
      />
      {unmatchedEmail && (
        <Animated.Text
          entering={FadeInRight.duration(250)}
          exiting={FadeOutRight.duration(250)}
          className={'font-semibold text-sm self-end pt-1'}
          style={{ color: theme.text }}
        >
          PLease enter a valid Email :(
        </Animated.Text>
      )}
      <Button
        containerClassName="rounded-2xl justify-center items-center p-4"
        containerStyle={{
          backgroundColor: theme.primary,
          borderRadius: 16,
          marginTop: 14,
          opacity: email.length === 0 || unmatchedEmail ? 0.4 : 1,
        }}
        textStyle={{
          color: theme.text,
        }}
        disabled={email.length === 0 || unmatchedEmail}
        textClassName="font-bold text-xl"
        label="Next"
        onPress={() => {
          setAuth('signUpPassword');
          SE(email);
        }}
      />
    </Animated.View>
  );
};

const SignUp = ({ style, whichAuth, setAuth }: signUpProp) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const setMessage = useMessage().setMessage;
  const [confirmPass, setConfirmPass] = useState<string>('');
  const [loading, setLoading] = useState<boolean | null>(null);
  const storedEmail = useProfile.getState().email;
  useEffect(() => {
    setEmail(storedEmail || '');
  }, [storedEmail]);

  const onSignUp = async () => {
    const info = { email, name: email.split('@')[0], password: pass };
    await AsyncStorage.setItem('password', pass);
    console.log('Info: ', info);
    setLoading(true);
    await signup(info)
      .then(() => {
        setLoading(null);
        navigation.navigate('otp' as never);
      })
      .catch(err => {
        setMessage(err);
        setLoading(false);
      });
    console.log('Heyy');
  };
  return (
    <Animated.View
      className={
        'w-fit flex-1 px-4 self-center justify-self-center items-center justify-center'
      }
      style={style || {}}
    >
      {whichAuth === 'signUpEmail' ? (
        <Main setAuth={setAuth} email={email} setEmail={setEmail} />
      ) : whichAuth === 'signUpPassword' ? (
        <Animated.View
          entering={FadeInRight.duration(250)}
          exiting={FadeOutLeft.duration(250)}
        >
          <Password
            pass={pass}
            setPass={setPass}
            confirmPass={confirmPass}
            setConfirmPass={setConfirmPass}
            onPress={onSignUp}
            loading={loading}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};

export default SignUp;
