import './global.css';
import Main from './app/home/main';
import { SafeAreaView } from 'react-native-safe-area-context';
import notificationPermission from './permissions/notificationPermission';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from './app/auth/welcome';
import { useEffect } from 'react';
import Message from './components/message/message';
import notifee, { EventType } from '@notifee/react-native';
import Otp from './app/otp/otpScreen';
import useProfile from './store/useProfile';
import Invitation from './app/tabs/invitation';
import useSocketStore from './store/useSocketStore';
import refreshJWT from './functions/auth/refreshJWT';
import storagePermission from './permissions/storagePermission';
import FeedbackScreen from './components/feedback/feedbackScreen';
import useDeviceSetting from './store/useDeviceSetting';
import Settings from './components/settings/settingsScreen';
import ConfirmScreen from './components/popup/confirmScreen';
import useConfirmScreen from './store/useConfirmScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  const profile = useProfile(a => a.profile);
  const connect = useSocketStore(s => s.connect);
  const colors = useDeviceSetting(s => s.colors);
  console.log('profile:', profile);
  useEffect(() => {
    SystemNavigationBar.stickyImmersive();
    const init = async () => {
      await notificationPermission();
      await storagePermission();
    };
    init();
    profile && (async () => await refreshJWT())();
    const interval = setInterval(async () => {
      profile && (await refreshJWT());
      profile && console.log('Refreshing Token!');
    }, 5 * 1000 * 60);

    return () => {
      clearInterval(interval);
      SystemNavigationBar.navigationShow();
    };
  }, [profile]);
  const confirmScreenVisible = useConfirmScreen(s => s.isVisible);
  notifee.onForegroundEvent(data => {
    const { type, detail } = data;
    if (type === EventType.ACTION_PRESS) {
      if (detail?.pressAction?.id === 'join') {
        connect();
      } else {
        console.log('Declined');
      }
    }
  });
  return (
    <>
      <Message />
      {confirmScreenVisible && <ConfirmScreen />}
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!profile ? (
              <>
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="otp" component={Otp} />
              </>
            ) : (
              <>
                <Stack.Screen name="Main" component={Main} />
                <Stack.Screen name="invitation" component={Invitation} />
                <Stack.Screen
                  name="feedback"
                  component={FeedbackScreen}
                  options={{
                    headerShown: true,
                    headerTitle: 'Feedback',
                    headerStyle: {
                      backgroundColor: colors.background,
                    },
                    headerTitleStyle: {
                      color: colors.text,
                    },
                    headerTintColor: colors.text,
                  }}
                />
                <Stack.Screen
                  name="settings"
                  component={Settings}
                  options={{
                    headerShown: true,
                    headerTitle: 'Settings',
                    headerStyle: {
                      backgroundColor: colors.background,
                    },
                    headerTitleStyle: {
                      color: colors.text,
                    },
                    headerTintColor: colors.text,
                  }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
}
