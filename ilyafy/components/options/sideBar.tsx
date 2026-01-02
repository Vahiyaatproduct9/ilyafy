import { View, Text, Dimensions, Pressable } from 'react-native';
import React from 'react';
import useDeviceSetting from '../../store/useDeviceSetting';
import Icon from '../icons/icon';
import smile from '../../assets/icons/smile.svg';
import Button from '../buttons/button1';
import useProfile from '../../store/useProfile';

import Animated, {
  FadeIn,
  FadeInLeft,
  FadeOut,
  FadeOutLeft,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

type barProps = {
  setSideBarVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const SideBar = (props: barProps) => {
  const navigation = useNavigation();
  const colors = useDeviceSetting(s => s.colors);
  const setProfile = useProfile(s => s.setProfile);
  const { height, width } = Dimensions.get('screen');
  const AP = Animated.createAnimatedComponent(Pressable);
  const profile = useProfile(s => s.profile);
  const showFeedbackScreen = () => {
    navigation.navigate('feedback' as never);
  };
  return (
    <AP
      onPress={() => props.setSideBarVisible(false)}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      className="absolute bg-[rgba(100,100,100,0.4)] bottom-0 right-0 top-0 left-0 z-50"
      style={{
        height,
        width,
      }}
    >
      <View pointerEvents="box-only">
        <Animated.View
          entering={FadeInLeft.duration(250)}
          exiting={FadeOutLeft.duration(250)}
          className="h-full self-start p-10 justify-between min-w-[80%]"
          style={{ backgroundColor: colors.primary }}
        >
          <View>
            <Icon
              component={smile}
              className="self-end"
              size={100}
              fill={colors.text}
            />
            <View>
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                {profile?.name}
              </Text>
              <Text className="text-l" style={{ color: colors.text }}>
                {profile?.email}
              </Text>
            </View>
          </View>
          <View className="flex-col gap-2">
            <Button
              label="Feedback"
              textStyle={{
                color: colors.text,
              }}
              textClassName="text-l font-bold"
              containerStyle={{
                backgroundColor: colors.background,
              }}
              onPress={showFeedbackScreen}
              containerClassName="items-center rounded-2xl justify-center w-full py-5 bg-red-600"
            />
            <Button
              label="Sign Out"
              textStyle={{
                color: colors.text,
              }}
              textClassName="text-l font-bold"
              containerStyle={{
                backgroundColor: colors.background,
              }}
              onPress={() => setProfile(null)}
              containerClassName="items-center rounded-2xl justify-center w-full py-5 bg-red-600"
            />
          </View>
        </Animated.View>
      </View>
    </AP>
  );
};

export default SideBar;
