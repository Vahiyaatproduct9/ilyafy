import { View, Dimensions, TextInput } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import theme from '../../data/color/theme';
import Animated from 'react-native-reanimated';
import Icon from '../../components/icons/icon';
import Add from '../../assets/icons/add.svg';
import Search from '../../assets/icons/search.svg';
import Popup from '../../components/popup/popup';
import Options from '../../assets/icons/options.svg';
import SongOptions from '../../components/options/songOptions';
import Item from '../../components/playlist/song';
import TrackPlayer from 'react-native-track-player';
import useProfile from '../../store/useProfile';
import useSongs from '../../store/useSongs';
const Playlist = () => {
  const [addShown, showAddScreen] = useState<boolean>(false);
  const [options, setOptions] = useState<string | null>(null);
  const [value, setValue] = useState<string>('');
  const accessToken = useProfile(s => s.accessToken);
  const width = Dimensions.get('window').width - 16;
  const { add, delete: del, songs, load } = useSongs();
  const delSong = async () => {
    const response = await del(options || '');
    if (response?.success) {
      setOptions(null);
    }
  };
  const loadSongs = useCallback(async () => {
    await load(accessToken || '');
  }, [accessToken, load]);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);
  async function addSong() {
    return await add(value);
  }
  const functionList = [
    {
      title: 'Delete',
      func: () => delSong(),
    },
  ];
  return (
    <View
      className="flex-1 gap-2 items-center"
      style={{ width, backgroundColor: theme.secondary }}
    >
      {addShown && (
        <Popup
          setValue={setValue}
          value={value}
          func={addSong}
          showPopup={showAddScreen}
        />
      )}
      {options && (
        <SongOptions
          song={songs.filter(t => t.id === options)[0]}
          setOptions={setOptions}
          functionList={functionList}
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
        data={songs || []}
        renderItem={({ index, item }) => (
          <Item song={item} i={index} showOptionsOf={setOptions} />
        )}
        className={'w-full'}
      />
    </View>
  );
};

export default Playlist;
