import { View, Dimensions, TextInput, Text } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from '../../components/icons/icon';
import Add from '../../assets/icons/add.svg';
import Search from '../../assets/icons/search.svg';
import Popup from '../../components/popup/popup';
import SongOptions from '../../components/options/songOptions';
import Item from '../../components/playlist/song';
import useProfile from '../../store/useProfile';
import useSongs from '../../store/useSongs';
import EmptyPlaylist from '../../components/blank/emptyPlaylist';
import useMessage from '../../store/useMessage';
import useDeviceSetting from '../../store/useDeviceSetting';
const Playlist = () => {
  const [addShown, showAddScreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [options, setOptions] = useState<string | null>(null);
  const [value, setValue] = useState<string>('');
  const setMessage = useMessage(s => s.setMessage);
  const accessToken = useProfile(s => s.accessToken);
  const width = Dimensions.get('window').width - 16;
  const { add, delete: del, load } = useSongs();
  const songs = useSongs(s => s.songs);
  const colors = useDeviceSetting(s => s.colors);
  const delSong = async () => {
    const response = await del(options || '');
    setMessage(response?.message || '');
    if (response?.success) {
      setOptions(null);
    }
  };
  const loadSongs = useCallback(async () => {
    await load(accessToken || '');
  }, [accessToken, load]);
  useEffect(() => {
    console.log(loading);
  }, [loading]);
  useEffect(() => {
    setLoading(true);
    loadSongs()
      .then(() => {
        setLoading(null);
        console.log('true');
      })
      .catch(() => {
        console.log('false');
        setLoading(false);
      });
  }, [loadSongs]);
  useEffect(() => {
    console.log('Songs:', songs);
  }, [songs]);
  async function addSong() {
    return await add(value);
  }
  const functionList = [
    {
      title: 'Delete',
      func: () => delSong(),
    },
  ];
  const primaryColor = useSharedValue(colors.primary);

  useEffect(() => {
    primaryColor.value = withSpring(colors.primary, { damping: 1000 });
  }, [primaryColor, colors.primary]);

  const rPrimaryColorStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: primaryColor.value,
    };
  });
  return (
    <View
      className="flex-1 gap-2 items-center"
      style={{ width, backgroundColor: colors.secondary }}
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
            style={{ color: colors.text }}
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
          fill={colors.text}
        />
      </View>
      {songs.length === 0 ? (
        <EmptyPlaylist />
      ) : (
        <Animated.FlatList
          data={songs || []}
          renderItem={({ index, item }) => (
            <Item
              colors={rPrimaryColorStyle}
              song={item}
              i={index}
              showOptionsOf={setOptions}
            />
          )}
          ListFooterComponent={
            <View className="w-full p-14 mb-[80px] justify-center items-center">
              <Text
                className="text-xl font-normal"
                style={{ color: colors.text }}
              >
                You've reached the end!
              </Text>
            </View>
          }
          className={'w-full'}
        />
      )}
    </View>
  );
};

export default Playlist;
