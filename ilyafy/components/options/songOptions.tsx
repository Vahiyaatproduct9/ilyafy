import { Text, Pressable } from 'react-native';
import React, { Dispatch, SetStateAction, useMemo } from 'react';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { songProp } from '../../types/songs';
import Button from '../buttons/button1';
import { Track } from 'react-native-track-player';
import useDeviceSetting from '../../store/useDeviceSetting';

type functionList = {
  title: string;
  func: () => void;
}[];

type optionProp = {
  song?: songProp | Track | undefined;
  setOptions: Dispatch<SetStateAction<string | null>>;
  functionList?: functionList;
};

const SongOptions = ({ song, functionList, setOptions }: optionProp) => {
  const colors = useDeviceSetting(s => s.colors);
  const options = useMemo(() => {
    return (
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        className={
          'w-full h-fit bottom-2 self-end rounded-xl p-2 overflow-hidden z-[50]'
        }
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="font-semibold text-xl" style={{ color: colors.text }}>
          {song?.title || ''}
        </Text>
        <Text className="text-l self-end" style={{ color: colors.text }}>
          {song?.artist || ''}
        </Text>
        {functionList?.map((f, i) => {
          return (
            <Button
              key={i}
              label={f.title}
              containerClassName="p-3 rounded-xl w-full mt-4"
              containerStyle={{ backgroundColor: colors.secondary }}
              textClassName="color-gray-400 font-bold"
              onPress={f?.func}
            />
          );
        })}
      </Animated.View>
    );
  }, [
    colors.primary,
    colors.secondary,
    colors.text,
    functionList,
    song?.artist,
    song?.title,
  ]);
  console.log('song: ', song);
  const AP = Animated.createAnimatedComponent(Pressable);
  return (
    <AP
      onPress={() => setOptions(null)}
      className={
        'absolute flex-row h-full w-full top-0 left-0 bg-[rgba(0,0,0,0.4)] p-2  z-[100]'
      }
    >
      {options}
    </AP>
  );
};

export default SongOptions;
