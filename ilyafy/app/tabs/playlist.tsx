import {
  View,
  Text,
  Dimensions,
  Image,
  Pressable,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import theme from '../../data/color/theme';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import Icon from '../../components/icons/icon';
const image = require('../../assets/images/background.png');
import Add from '../../assets/icons/add.svg';
import Search from '../../assets/icons/search.svg';
import Popup from '../../components/popup/popup';
import Options from '../../assets/icons/options.svg';
import PL from '../../functions/playlist';
import { PlaylistProp, songProp } from '../../types/songs';
import SongOptions from '../../components/options/songOptions';
const Playlist = () => {
  const [addShown, showAddScreen] = useState<boolean>(false);
  const [playlist, setPLaylist] = useState<PlaylistProp | []>([]);
  const [options, setOptions] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      const localPlaylist = await PL.getSongs();
      setPLaylist(localPlaylist);
    })();
  }, []);
  const width = Dimensions.get('window').width - 16;
  function showOptionsOf(i: number) {
    setOptions(i);
  }
  return (
    <View
      className="flex-1 gap-2 items-center"
      style={{ width, backgroundColor: theme.secondary }}
    >
      {addShown && (
        <Popup setPlaylist={setPLaylist} showPopup={showAddScreen} />
      )}
      {options && (
        <SongOptions
          i={options}
          setPlaylist={setPLaylist}
          song={playlist.filter(t => t.index === options)[0]}
          setOptions={setOptions}
        />
      )}
      <View className="justify-end w-full gap-2 flex-row p-2">
        <View className="flex-1 flex-row items-center border-2 border-white rounded-full">
          <Icon component={Search} size={28} className="ml-4" fill="white" />
          <TextInput
            style={{ color: theme.text }}
            inlineImageLeft="../../assets/icons/search.svg"
            className="flex-1 font-semibold px-6"
            placeholder="Search Songs you've Saved"
            keyboardType="default"
            returnKeyType="search"
            returnKeyLabel="search"
          />
        </View>
        <Icon
          component={Add}
          onPress={() => showAddScreen(true)}
          className="border-[2px] border-white"
          size={28}
          fill={theme.text}
        />
      </View>
      <Animated.FlatList
        data={playlist}
        renderItem={({ index, item }) => (
          <Item song={item} i={index} showOptionsOf={showOptionsOf} />
        )}
        className={'w-full'}
      />
    </View>
  );
};

export default Playlist;

const Item = ({
  i,
  song,
  showOptionsOf,
}: {
  i: number | null;
  song: songProp;
  showOptionsOf: (i: number) => void;
}) => {
  return (
    <Pressable key={i} onPress={() => {}} className="w-full my-1 flex-row px-2">
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutUp}
        className={'flex-row flex-1 rounded-2xl p-1'}
        style={{ backgroundColor: theme.primary }}
      >
        <Image
          source={song.thumbnail ? { uri: song.thumbnail } : image}
          className="h-20 w-20 rounded-2xl self-center "
        />
        <View className="p-3 flex-1">
          <Text className="font-semibold text-xl" style={{ color: theme.text }}>
            {song?.title || 'Unknown Song'}
          </Text>
          <Text className="font-thin text-l" style={{ color: theme.text }}>
            {song?.artist || 'Unknown Artist'}
          </Text>
        </View>
        <View className="items-center justify-center p-2">
          <Icon
            component={Options}
            onPress={() => showOptionsOf(song.index)}
            fill={theme.text}
            size={28}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
};
