import React from 'react';
import Animated, { FadeIn, FadeOutLeft } from 'react-native-reanimated';
import Button from '../../buttons/button1';
import theme from '../../../data/color/theme';
import { authMethod } from '../../../types/components';

type props = {
  setAuth: React.Dispatch<React.SetStateAction<authMethod>>;
};

const Hero = ({ setAuth }: props) => {
  return (
    <Animated.View
      className="w-full"
      entering={FadeIn.duration(500)}
      exiting={FadeOutLeft.duration(500)}
    >
      <Button
        label="Sign Up"
        containerClassName="p-3 my-2 w-[70%] self-start items-center justify-center
                rounded-xl rounded-r-[100px]"
        containerStyle={{
          backgroundColor: theme.primary,
        }}
        onPress={() => setAuth('signUpEmail')}
        textClassName="color-slate-100 text-xl font-semibold"
      />
      <Button
        label="Login"
        containerClassName="my-2 w-[70%] p-3 self-end items-center justify-center
                  border-2 rounded-xl rounded-l-[100px]"
        containerStyle={{
          borderColor: theme.primary,
        }}
        textClassName="color-slate-100 text-xl font-semibold"
        onPress={() => setAuth('login')}
      />
    </Animated.View>
  );
};

export default Hero;
