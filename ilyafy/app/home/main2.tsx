import list from '../../api/playlist/list';
import { View, Text, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import Button from '../../components/buttons/button1';
import useSocketStore, { commandEmitter } from '../../store/useSocketStore';
import useProfile from '../../store/useProfile';
import theme from '../../data/color/theme';
import Add from '../../assets/icons/add.svg';
import Icon from '../../components/icons/icon';
import Item from '../../components/playlist/song';
import Animated from 'react-native-reanimated';
import Popup from '../../components/popup/popup';
import SongOptions from '../../components/options/songOptions';
import { PlaylistProp } from '../../types/songs';
import useMessage from '../../store/useMessage';
import post from '../../api/playlist/post';
import deleteSong from '../../api/playlist/delete';
import TrackPlayer from 'react-native-track-player';
import saveAndStream from '../../functions/stream/saveAndStream';
import { TextInput } from 'react-native';
import useBackend from '../../store/useBackend';
// import TrackPlayer from 'react-native-track-player'
const Main = () => {
  const width = Dimensions.get('window').width - 16;
  const [loading, setLoading] = useState<boolean | null>(null);
  const setProfile = useProfile.getState().setProfile;
  const profile = useProfile.getState().profile;
  const roomId = profile?.room_part_of;
  const connect = useSocketStore().connect;
  const isConnected = useSocketStore.getState().isConnected;
  const [addShown, showAddScreen] = useState<boolean>(false);
  const setMessage = useMessage().setMessage;
  const [options, setOptions] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistProp | []>([]);
  const [value, setValue] = useState<string>('');
  const { setBackend, backend } = useBackend();
  const Connect = async () => {
    setLoading(true);
    connect();
    setLoading(null);
    commandEmitter.on('reject', () => {
      setLoading(false);
    });
  };
  const signOut = () => {
    setProfile(null);
  };
  const showOptionsOf = (i: string) => {
    setOptions(i);
  };
  const addSong = async () => {
    const response = await post(value);
    setMessage(response?.message || '');
    console.log('added song:', response);
    if (response?.success) {
      setPlaylist(prev => [...prev, response?.song]);
    }
    return response;
  };
  const delSong = async (id: string) => {
    const response = await deleteSong(id);
    if (response?.success) {
      setMessage('Deleted!');
      setPlaylist(prev => prev.filter(t => t.id !== id));
      const queue = await TrackPlayer.getQueue();
      const song = playlist.find(t => t.id === id);
      await TrackPlayer.remove(queue.findIndex(t => t.url === song?.url));
    }
    setOptions(null);
    return response;
  };
  const load = async () => {
    const response = await list();
    setPlaylist(response);
    if (response) {
      await TrackPlayer.reset();
      // iterate over the fresh response (not the stale state variable)
      for (const song of response) {
        // if (song.playable) {
        if (false) {
          await TrackPlayer.add({
            mediaId: song.id,
            url: song.url,
            artwork: song.thumbnail,
            artist: song.artist,
            title: song.title,
          });
        } else {
          const task = await saveAndStream(song.ytUrl);
          const path = task?.localPath;
          const headers = task?.headers;
          const metadata = task?.metadata;

          // if we don't have a path, skip adding this track
          if (!path) continue;

          const isStreamed =
            path.startsWith('https://') || path.startsWith('http://');

          const trackUrl = isStreamed ? path : `file://${path}`;

          const headerDuration = headers?.['X-Duration'];
          const computedDuration = isStreamed
            ? metadata?.duration
            : headerDuration
            ? parseInt(headerDuration, 10) || undefined
            : undefined;

          await TrackPlayer.add({
            mediaId: song.id,
            url: trackUrl,
            title: song.title || 'Streamed Audio',
            artist: song.artist || 'Ilyafy',
            artwork: song.thumbnail || require('../../data/test.png'),
            duration: computedDuration,
          });
        }
      }
    }
    await TrackPlayer.play();
    console.log(await TrackPlayer.getQueue());
  };
  useEffect(() => {
    load();
  }, []);
  const signOutButton = () => {
    return (
      <Button
        label="Sign Out"
        loading={loading}
        containerClassName="rounded-2xl items-center w-max-[80%] justify-center px-6 py-4 border-2 border-white"
        textStyle={{
          color: theme.text,
        }}
        onPress={signOut}
      />
    );
  };
  const connectButton = () => {
    return (
      <Button
        label={isConnected ? 'Connected!' : `Connect`}
        loading={loading}
        containerClassName="rounded-2xl items-center w-max-[80%] justify-center px-6 py-4 border-2 border-white"
        textStyle={{
          color: theme.text,
        }}
        disabled={isConnected}
        onPress={Connect}
      />
    );
  };
  const addButton = () => {
    return (
      <Icon
        component={Add}
        onPress={() => showAddScreen(true)}
        className="border-[2px] border-white"
        size={28}
        fill={theme.text}
      />
    );
  };
  return (
    <View
      className="w-full bg-[rgba(33,33,78,0.38)] gap-4 items-center"
      style={{ width }}
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
      <View className="w-full p-3 flex-row gap-2 justify-end">
        <Button
          label="Reload"
          containerClassName="border-2 rounded-2xl p-2  items-center justify-center border-white"
          onPress={load}
          textStyle={{
            color: theme.text,
          }}
        />
        {addButton()}
        {roomId && connectButton()}
        {signOutButton()}
      </View>
      <View className="flex-1 w-full">
        <Animated.FlatList
          data={playlist}
          renderItem={({ index, item }) => (
            <Item song={item} i={index} showOptionsOf={showOptionsOf} />
          )}
          className={'w-full'}
        />
        <TextInput
          value={backend || ''}
          onChangeText={setBackend}
          className="border-2 rounded-2xl px-2 font-thin text-xl color-white border-white"
          placeholder="Enter backend url"
        />
      </View>
    </View>
  );
};

export default Main;
