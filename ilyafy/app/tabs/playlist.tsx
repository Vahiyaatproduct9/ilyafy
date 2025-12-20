import { View, Dimensions, TextInput, Text } from 'react-native';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import theme from '../../data/color/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from '../../components/icons/icon';
import Add from '../../assets/icons/add.svg';
import Search from '../../assets/icons/search.svg';
import Popup from '../../components/popup/popup';
import Item from '../../components/playlist/song';
import useProfile from '../../store/useProfile';
import useSongs from '../../store/useSongs';
import EmptyPlaylist from '../../components/blank/emptyPlaylist';
// import useMessage from '../../store/useMessage';
import useDeviceSetting from '../../store/useDeviceSetting';
import TrackPlayer, { Track } from 'react-native-track-player';
import Loading from '../../components/blank/loading';
import Fuse, { FuseResult } from 'fuse.js';
import { CTrack } from '../../types/songs';
const Playlist = ({
  setSong,
}: {
  setSong: Dispatch<SetStateAction<Track | null>>;
}) => {
  const [addShown, showAddScreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [value, setValue] = useState<string>('');
  const [searchResult, setSearchResult] = useState<
    CTrack | FuseResult<CTrack>[] | []
  >([]);
  const accessToken = useProfile(s => s.accessToken);
  const width = Dimensions.get('window').width - 16;
  const { add, load } = useSongs();
  const songs = useSongs(s => s.songs);
  const [searchItem, setSearchItem] = useState<string>('');
  const isLoading = useSongs(s => s.isLoading);
  const colors = useDeviceSetting(s => s.colors);

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
    const fuse = new Fuse(songs, {
      shouldSort: true,
      keys: ['title', 'artist'],
    });
    const searchList = fuse.search(searchItem);
    if (searchItem.length > 0) setSearchResult(searchList);
    else setSearchResult([]);
  }, [songs, searchItem]);
  useEffect(() => {
    console.log('Songs:', songs);
    (async () => {
      console.log('Queue:', await TrackPlayer.getQueue());
    })();
  }, [songs]);
  async function addSong() {
    return await add(value);
  }
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
      <View className="justify-end w-full gap-2 flex-row p-2">
        <View className="flex-1 flex-row items-center border-2 border-white rounded-full">
          <Icon component={Search} size={28} className="ml-4" fill="white" />
          <TextInput
            value={searchItem}
            onChangeText={setSearchItem}
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
      {songs.length === 0 ? (
        isLoading ? (
          <Loading />
        ) : (
          <EmptyPlaylist />
        )
      ) : (
        <Animated.FlatList
          data={
            searchResult.length > 0
              ? searchResult.map((i: any) => i.item)
              : songs || []
          }
          renderItem={({ index, item }) => (
            <Item
              colors={rPrimaryColorStyle}
              song={item}
              i={index}
              setSelectedSong={setSong}
            />
          )}
          ListFooterComponent={
            isLoading ? (
              <Loading />
            ) : (
              <View className="w-full p-14 mb-[80px] justify-center items-center">
                <Text
                  className="text-xl font-normal"
                  style={{ color: theme.text }}
                >
                  You've reached the end!
                </Text>
              </View>
            )
          }
          className={'w-full'}
        />
      )}
    </View>
  );
};

export default Playlist;
