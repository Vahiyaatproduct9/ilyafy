import { Text, Pressable } from 'react-native';
import React, { Dispatch, SetStateAction } from 'react';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { songProp } from '../../types/songs';
import theme from '../../data/color/theme';
import Button from '../buttons/button1';

type optionProp = {
  i: string;
  song: songProp;
  setOptions: Dispatch<SetStateAction<string | null>>;
  delSong: (i: string) => any;
};

const SongOptions = ({ i, song, delSong, setOptions }: optionProp) => {
  console.log('song: ', song);
  const deleteSong = async (index: string) => {
    await delSong(index);
  };
  const AP = Animated.createAnimatedComponent(Pressable);
  return (
    <AP
      onPress={() => setOptions(null)}
      className={
        'absolute z-50 flex-row h-full w-full top-0 left-0 bg-[rgba(0,0,0,0.4)] p-2'
      }
    >
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        className={
          'w-full h-fit bottom-2 self-end rounded-xl p-2 overflow-hidden'
        }
        style={{ backgroundColor: theme.primary }}
      >
        <Text className="font-semibold text-xl" style={{ color: theme.text }}>
          {song.title}
        </Text>
        <Text className="text-l self-end" style={{ color: theme.text }}>
          {song.artist}
        </Text>
        <Button
          label="Delete"
          containerClassName="p-3 rounded-xl w-full mt-4"
          containerStyle={{ backgroundColor: theme.secondary }}
          textClassName="color-gray-400 font-bold"
          onPress={() => deleteSong(i)}
        />
      </Animated.View>
    </AP>
  );
};

export default SongOptions;
