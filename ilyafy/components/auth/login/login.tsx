/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';
import usePageTransition from '../../animation/pageTransitions/pageTransition';
import Button from '../../buttons/button1';
import theme from '../../../data/color/theme';
import { TextInput, ViewProps } from 'react-native';
import login from '../../../api/auth/login';
import useMessage from '../../../store/useMessage';

const Login = ({ style }: { style?: ViewProps | AnimationEvent }) => {
  const pageTransition = usePageTransition();
  const exitTransition = pageTransition.exitTransition;
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean | null>(null);
  const setMessage = useMessage().setMessage;
  const onLogin = async () => {
    setLoading(true);
    await login({ email, password })
      .then(res => {
        if (res?.token.success) setLoading(null);
        else setLoading(false);
        setMessage(res?.message || '');
      })
      .catch(err => {
        setLoading(false);
        setMessage(err);
      });
  };
  const ValidEmail = email.includes('@') && email.includes('.');
  const validPass = password.length >= 8;
  return (
    <Animated.View
      className={
        'w-fit flex-1 px-4 self-center justify-self-center items-center justify-center'
      }
      style={style || {}}
    >
      <Animated.View style={exitTransition} className={'gap-2'}>
        <TextInput
          className={
            'flex-1 w-[300px] px-2 text-l border-white border-[1px] rounded-2xl'
          }
          style={{
            backgroundColor: 'rgba(192,194,201, 0.4)',
            color: theme.text,
            borderColor: email.length < 5 || ValidEmail ? 'white' : 'red',
          }}
          textAlign={'center'}
          textAlignVertical={'center'}
          placeholder={'Email'}
          keyboardType={'email-address'}
          value={email}
          onChangeText={setEmail}
        />
        {email.length >= 1 && !ValidEmail && (
          <Animated.Text
            entering={FadeInRight.duration(250)}
            exiting={FadeOutRight.duration(250)}
            className={'font-semibold text-sm self-end pt-1'}
            style={{ color: theme.text }}
          >
            Please Enter a Valid Email :(
          </Animated.Text>
        )}
        <TextInput
          className={
            'flex-1 w-[300px] px-2 text-l border-white border-[1px] rounded-2xl'
          }
          style={{
            color: theme.text,
            backgroundColor: 'rgba(192,194,201, 0.4)',
            borderColor: password.length === 0 || validPass ? 'white' : 'red',
          }}
          textAlign={'center'}
          textAlignVertical={'center'}
          placeholder={'Password'}
          keyboardAppearance={'dark'}
          secureTextEntry
          textContentType={'password'}
          returnKeyType={'done'}
          value={password}
          onChangeText={setPassword}
        />
        {password.length >= 5 && !validPass && (
          <Animated.Text
            entering={FadeInRight.duration(250)}
            exiting={FadeOutRight.duration(250)}
            className={'font-semibold text-sm self-end pt-1'}
            style={{ color: theme.text }}
          >
            Password must be 8 chars long :(
          </Animated.Text>
        )}
        <Button
          label="Login"
          containerClassName="rounded-2xl justify-center items-center p-4"
          containerStyle={{
            backgroundColor: theme.primary,
            borderRadius: 16,
            marginTop: 14,
            opacity: !validPass || !ValidEmail ? 0.4 : 1,
          }}
          textStyle={{
            color: theme.text,
          }}
          loading={loading}
          disabled={!validPass || !ValidEmail}
          textClassName="font-bold text-xl"
          onPress={onLogin}
        />
      </Animated.View>
    </Animated.View>
  );
};

export default Login;
