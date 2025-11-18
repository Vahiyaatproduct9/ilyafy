import './global.css';
import Main from './app/home/main';
import { SafeAreaView } from 'react-native-safe-area-context';
// import useSocketStore from './store/useSocketStore';
// import { setupPlayer } from './functions/setupPlayer';
import notificationPermission from './permissions/notificationPermission';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from './app/auth/welcome';
import { useEffect } from 'react';
import Message from './components/message/message';
import Otp from './app/otp/otpScreen';
const Stack = createNativeStackNavigator();
export default function App() {
  useEffect(() => {
    SystemNavigationBar.stickyImmersive();
    const init = async () => {
      await notificationPermission();
      //   await setupPlayer();
    };
    init();
    return () => {
      SystemNavigationBar.navigationShow();
    };
  }, []);
  return (
    <>
      <Message />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="otp" component={Otp} />
            <Stack.Screen name="Main" component={Main} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
}
