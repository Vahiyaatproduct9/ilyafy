import { Pressable, Text, TextInput, View } from 'react-native';
import React, { Dispatch, SetStateAction, useState } from 'react';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import theme from '../../data/color/theme';
import Button from '../buttons/button1';
import addToPLaylist from '../../functions/stream/addToPLaylist';
import useMessage from '../../store/useMessage';

const Popup = ({
  showPopup,
}: {
  showPopup: Dispatch<SetStateAction<boolean>>;
}) => {
  // const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean | null>(null);
  const setMessage = useMessage().setMessage;
  async function Add() {
    setLoading(true);
    const response = await addToPLaylist(value);
    if (response?.success) {
      setMessage('Song Added to PLaylist :D');
      setLoading(null);
    } else {
      setMessage('Some Error Occured! :(');
      setLoading(false);
    }
  }
  return (
    <Pressable
      onPress={() => showPopup(false)}
      className={
        'absolute h-full w-full bg-[rgba(0,0,0,0.4)] z-50 items-center justify-center'
      }
    >
      <View pointerEvents="box-only">
        <Animated.View
          className={'p-5 rounded-2xl'}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            backgroundColor: theme.primary,
            boxShadow: '0 0 26px 0 rgba(0,0,0,0.2)',
          }}
          entering={FadeInUp.duration(250)}
          exiting={FadeOutUp.duration(250)}
        >
          <Text className="font-normal text-xl" style={{ color: theme.text }}>
            Paste a Youtube URL to save!
          </Text>
          <TextInput
            className="px-4 border-2 z-10 font-thin text-xl rounded-full p-2"
            style={{ borderColor: theme.secondary, color: theme.text }}
            value={value}
            onChangeText={setValue}
            focusable
          />
          <Button
            label="Add"
            containerClassName="border-2 px-4 min-h-10 min self-end py-1 mt-3 rounded-full"
            textClassName="text-xl font-normal"
            textStyle={{ color: theme.text }}
            // eslint-disable-next-line react-native/no-inline-styles
            containerStyle={{
              borderColor: theme.secondary,
              opacity: value.length < 3 ? 0.4 : 1,
            }}
            disabled={value.length < 3}
            onPress={Add}
            loading={loading}
          />
        </Animated.View>
      </View>
    </Pressable>
  );
};

export default Popup;
