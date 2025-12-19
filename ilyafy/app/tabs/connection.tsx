import { View, Text, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import getRoommate from '../../api/room/getRoommate';
import useProfile from '../../store/useProfile';
import Button from '../../components/buttons/button1';
import pokeUser from '../../api/room/pokeUser';
import useDeviceSetting from '../../store/useDeviceSetting';
import smile from '../../assets/icons/smile.svg';
import excited from '../../assets/icons/excited.svg';
import calm from '../../assets/icons/calm.svg';
import Icon from '../../components/icons/icon';
import useMessage from '../../store/useMessage';
import useSocketStore from '../../store/useSocketStore';
import link from '../../assets/icons/link.svg';
import link_off from '../../assets/icons/link_off.svg';
import { commandEmitter } from '../../store/useSocketStore';

const Connection = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const setMessage = useMessage?.getState()?.setMessage;
  const accessToken = useProfile(s => s.accessToken);
  const colors = useDeviceSetting(s => s.colors);
  const width = Dimensions.get('window').width - 16;
  const isConnected = useSocketStore?.getState()?.isConnected;
  const connect = useSocketStore().connect;
  const [partner, setPartner] = useState<
    | []
    | {
        id: string;
        name: string;
        email: string;
      }[]
  >();
  const room_part_of = useProfile().profile?.room_part_of;
  useEffect(() => {
    getRoommate(accessToken ?? undefined)
      .then(response => {
        if (response?.success)
          setPartner([
            {
              id: response?.user?.id || '',
              name: response?.user?.name || '',
              email: response?.user?.email || '',
            },
          ]);
      })
      .catch(err => {
        console.log('error:', err);
        setMessage('Failed to fetch roommate');
        setPartner([]);
      });
  }, [accessToken, room_part_of, setMessage]);
  useEffect(() => {
    console.log('partner:', partner);
  }, [partner]);
  useEffect(() => {
    if (isConnected) {
      setMessage(`Connected with ${partner?.[0]?.name || 'Roommate'}`);
    } else {
      setMessage(`Disconnected from ${partner?.[0]?.name || 'Roommate'}`);
    }
  }, [isConnected, partner, setMessage]);
  const poke = async () => {
    setLoading(true);
    await pokeUser().then(res => {
      setMessage(res?.message || '');
      setLoading(false);
      return res;
    });
  };
  const toggleConnect = async () => {
    if (isConnected) {
      useSocketStore?.getState()?.disconnect();
      return;
    }
    connect();
    commandEmitter.on('reject', () => {
      setMessage("You aren't Authorized to join.");
    });
  };
  return (
    <View
      className="flex-1 h-full items-center p-5"
      style={{ width, backgroundColor: colors.background }}
    >
      <View className="flex-row w-full">
        <Text
          className="p-5 flex-1 text-xl font-bold"
          style={{ color: colors.text }}
        >
          Paired with
        </Text>
        <Icon
          component={isConnected ? link_off : link}
          fill={colors.text}
          size={24}
          className="rounded-full border-2 border-white"
          onPress={toggleConnect}
        />
      </View>
      {partner?.map((item, i) => {
        return (
          <View className="w-full" key={i}>
            <View className="p-4 flex-row">
              <Icon
                component={
                  Math.floor(Math.random() * 3) === 0
                    ? smile
                    : Math.floor(Math.random() * 2) === 0
                    ? excited
                    : calm
                }
                fill={colors.text}
                size={80}
              />
              <View className="flex-1 items-end gap-4 justify-center ml-4">
                <Text
                  className="text-2xl font-normal"
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{ color: colors.text, letterSpacing: 1 }}
                >
                  {item.name}
                </Text>
                <Text
                  className="text-l font-normal"
                  style={{ color: colors.text }}
                >
                  {item.email}
                </Text>
              </View>
            </View>
            <View className="justify-between flex-row">
              <Button
                label="UNPAIR"
                containerClassName="px-10 py-4 w-fit rounded-full"
                textStyle={{ color: colors.text, fontWeight: '600' }}
                containerStyle={{ backgroundColor: colors.accent }}
              />
              <Button
                label="POKE"
                onPress={poke}
                loading={loading}
                containerClassName="px-10 py-4 w-fit rounded-full"
                textStyle={{ color: colors.text, fontWeight: '600' }}
                containerStyle={{ backgroundColor: colors.accent }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default Connection;
