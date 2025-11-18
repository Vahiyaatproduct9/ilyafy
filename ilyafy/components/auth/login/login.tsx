/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import Animated from 'react-native-reanimated';
import usePageTransition from '../../animation/pageTransitions/pageTransition';
import Button from '../../buttons/button1';
import theme from '../../../data/color/theme';
import { TextInput, ViewProps } from 'react-native';
import login from '../../../api/auth/login';

const Login = ({ style }: { style?: ViewProps | AnimationEvent }) => {
  const AnimatedTI = Animated.createAnimatedComponent(TextInput);
  const pageTransition = usePageTransition();
  const exitTransition = pageTransition.exitTransition;
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const onLogin = async () => {
    await login({ email, password });
  };
  return (
    <Animated.View
      className={
        'w-fit flex-1 px-4 self-center justify-self-center items-center justify-center'
      }
      style={style || {}}
    >
      <Animated.View style={exitTransition} className={'gap-2'}>
        <AnimatedTI
          className={
            'flex-1 w-[300px] px-2 text-l border-white border-[1px] rounded-2xl'
          }
          style={{
            backgroundColor: 'rgba(192,194,201, 0.4)',
          }}
          textAlign={'center'}
          textAlignVertical={'center'}
          placeholder={'Email'}
          keyboardType={'email-address'}
          value={email}
          onChangeText={setEmail}
        />
        <AnimatedTI
          className={
            'flex-1 w-[300px] px-2 text-l border-white border-[1px] rounded-2xl'
          }
          style={{
            backgroundColor: 'rgba(192,194,201, 0.4)',
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
        <Button
          label="Login"
          containerClassName="rounded-2xl justify-center items-center p-4"
          containerStyle={{
            backgroundColor: theme.primary,
            borderRadius: 16,
            marginTop: 14,
          }}
          textStyle={{
            color: theme.text,
          }}
          textClassName="font-bold text-xl"
          onPress={onLogin}
        />
      </Animated.View>
    </Animated.View>
  );
};

export default Login;
