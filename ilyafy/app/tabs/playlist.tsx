import { View, Dimensions, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import theme from '../../data/color/theme';
import Animated from 'react-native-reanimated';
import Icon from '../../components/icons/icon';
import Add from '../../assets/icons/add.svg';
import Search from '../../assets/icons/search.svg';
import Popup from '../../components/popup/popup';
import Options from '../../assets/icons/options.svg';
import PL from '../../functions/playlist';
import { PlaylistProp } from '../../types/songs';
import SongOptions from '../../components/options/songOptions';
import Item from '../../components/playlist/song';
import addToPLaylist from '../../functions/stream/addToPLaylist';
import pl from '../../functions/playlist';
const Playlist = () => {
  const [addShown, showAddScreen] = useState<boolean>(false);
  const [playlist, setPlaylist] = useState<PlaylistProp | []>([]);
  const [options, setOptions] = useState<string | null>(null);
  const [value, setValue] = useState<string>('');
  useEffect(() => {
    (async () => {
      const localPlaylist = await PL.getSongs();
      setPlaylist(localPlaylist);
    })();
  }, []);
  const width = Dimensions.get('window').width - 16;
  function showOptionsOf(i: string) {
    setOptions(i);
  }
  const addSong = async () => {
    const response = await addToPLaylist(value);
    if (response?.success) {
      setPlaylist(prev => [
        ...prev,
        {
          id: response?.id || Date.now().toString(),
          title: response?.title || 'Unknown Song',
          url: response?.url || '',
          thumbnail: response?.thumbnail || '',
          artist: response?.artist || '',
          playable: response?.playable || false,
          ytUrl: response?.ytLink || '',
        },
      ]);
      setValue('');
    }
    return response;
  };
  const delSong = async (index: string) => {
    await pl.deleteSong(index).then(() => {
      setPlaylist(prev =>
        prev
          .filter(t => t.id !== index)
          .map((s, ind) => {
            return { ...s, index: ind + 1 };
          }),
      );
      setOptions(null);
    });
  };
  return (
    <View
      className="flex-1 gap-2 items-center"
      style={{ width, backgroundColor: theme.secondary }}
    >
      {addShown && (
        <Popup
          setValue={setValue}
          value={value}
          setPlaylist={setPlaylist}
          addSong={addSong}
          showPopup={showAddScreen}
        />
      )}
      {options && (
        <SongOptions
          delSong={delSong}
          i={options}
          song={playlist.filter(t => t.id === options)[0]}
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
