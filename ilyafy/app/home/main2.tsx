import { View, Dimensions } from 'react-native';
import React, { useState } from 'react';
import Button from '../../components/buttons/button1';
import useSocketStore, { commandEmitter } from '../../store/useSocketStore';
import useProfile from '../../store/useProfile';
import theme from '../../data/color/theme';
import Add from '../../assets/icons/add.svg';
import Icon from '../../components/icons/icon';
import { TextInput } from 'react-native';
import useBackend from '../../store/useBackend';
const Main = () => {
  const width = Dimensions.get('window').width - 16;
  const [loading, setLoading] = useState<boolean | null>(null);
  const setProfile = useProfile?.getState()?.setProfile;
  const profile = useProfile?.getState()?.profile;
  const roomId = profile?.room_part_of;
  const connect = useSocketStore().connect;
  const isConnected = useSocketStore?.getState()?.isConnected;
  // const [options, setOptions] = useState<string | null>(null);
  // const [playlist, setPlaylist] = useState<PlaylistProp | []>([]);
  const { setBackend, backend } = useBackend();
  const toggleConnect = async () => {
    setLoading(true);
    if (isConnected) {
      useSocketStore?.getState()?.disconnect();
      setLoading(null);
      return;
    }
    connect();
    setLoading(null);
    commandEmitter.on('reject', () => {
      setLoading(false);
    });
  };
  const signOut = () => {
    setProfile(null);
  };
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
        disabled={loading ? true : false}
        onPress={toggleConnect}
      />
    );
  };
  const addButton = () => {
    return (
      <Icon
        component={Add}
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
      {/* {addShown && (
        <Popup
          setValue={setValue}
          value={value}
          setPlaylist={setPlaylist}
          addSong={addSong}
          showPopup={showAddScreen}
        />
      )} */}
      {/* {options && (
        <SongOptions
          delSong={delSong}
          i={options}
          song={playlist.filter(t => t.id === options)[0]}
          setOptions={setOptions}
        />
      )} */}
      <View className="w-full p-3 flex-row gap-2 justify-end">
        <Button
          label="Reload"
          containerClassName="border-2 rounded-2xl p-2  items-center justify-center border-white"
          textStyle={{
            color: theme.text,
          }}
        />
        {addButton()}
        {roomId && connectButton()}
        {signOutButton()}
      </View>
      <View className="flex-1 w-full">
        {/* <Animated.FlatList
          data={playlist}
          renderItem={({ index, item }) => (
            <Item song={item} i={index} showOptionsOf={showOptionsOf} />
          )}
          className={'w-full'}
        /> */}
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
