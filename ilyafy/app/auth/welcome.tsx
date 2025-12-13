/* eslint-disable react-native/no-inline-styles */
import { View, Text } from 'react-native';
import React, { useState } from 'react';
import AnimatedCircle from '../../components/animation/circle';
const icon = require('../../assets/images/icon.png');
import theme from '../../data/color/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SignUp from '../../components/auth/signUp/signUp';
import LoginScreen from '../../components/auth/login/login';
import Hero from '../../components/auth/hero/hero';
import BackArrow from '../../assets/icons/back_arrow.svg';
import Icon from '../../components/icons/icon';
// import { useAuth0, Auth0Provider } from 'react-native-auth0';
type authMethod = 'login' | 'signUpEmail' | 'signUpPassword' | null;
const Welcome = () => {
  // const { authorize, clearSession, user, isLoading } = useAuth0();
  const [whichAuth, setAuth] = useState<authMethod>(null);

  const opacity = useSharedValue(1);
  const size = useSharedValue(30);
  React.useEffect(() => {
    size.value = withTiming(300, { duration: 1000 });
    opacity.value = withDelay(1000, withTiming(0, { duration: 500 }));
  }, [opacity, size]);
  const logoAnimation = useAnimatedStyle(() => {
    return {
      width: size.value,
      height: size.value,
      opacity: opacity.value,
      display: opacity.value === 0 ? 'none' : 'flex',
    };
  });
  const randomBlocks = () =>
    Array(Math.floor(8 + Math.random() * 2))
      .fill(null)
      .map((_, i) => {
        return <AnimatedCircle key={i} />;
      });
  return (
    <View
      className={`flex-1 items-center justify-center p-4`}
      style={{
        backgroundColor: theme.background,
      }}
    >
      <GestureHandlerRootView style={{ height: '100%', width: '100%' }}>
        <View className="w-full h-full absolute">{randomBlocks()}</View>
      </GestureHandlerRootView>
      <Animated.Image
        source={icon}
        style={[logoAnimation]}
        className={'z-10'}
      />
      <View
        className="absolute items-center justify-center
      border-[rgba(255,255,255,0.5)] border-[1px] border-l-2
      z-10 w-full p-4 bg-[rgba(0,0,0,0.5)] rounded-xl"
      >
        <View className="flex-row justify-between self-end pb-4 w-full">
          {whichAuth && (
            <Icon
              onPress={() => {
                if (whichAuth === 'login' || whichAuth === 'signUpEmail') {
                  setAuth(null);
                } else if (whichAuth === 'signUpPassword') {
                  setAuth('signUpEmail');
                }
              }}
              size={28}
              fill={theme.text}
              component={BackArrow}
              className="border-[1px] rounded border-gray-500"
            />
          )}
          <Text className="text-white text-3xl font-bold m-4">Ilyafy</Text>
        </View>
        {whichAuth === null ? (
          <Hero setAuth={setAuth} />
        ) : whichAuth === 'login' ? (
          <LoginScreen />
        ) : whichAuth === 'signUpEmail' || whichAuth === 'signUpPassword' ? (
          <SignUp setAuth={setAuth} whichAuth={whichAuth} />
        ) : null}
      </View>
    </View>
  );
};

const MainPage = () => {
  return (
    // <Auth0Provider
    //   domain="dev-cum37g4rj2kg0uk8.us.auth0.com"
    //   clientId="pjKo7Jf7COYMFcIIsrCN57EVKCoyM9Te"
    // >
    <Welcome />
    // {/* </Auth0Provider> */}
  );
};

export default MainPage;
