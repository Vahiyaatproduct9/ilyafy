import { View, Text, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import theme from '../../data/color/theme';
import getRoommate from '../../api/room/getRoommate';
import useProfile from '../../store/useProfile';
import Button from '../../components/buttons/button1';
import pokeUser from '../../api/room/pokeUser';

const Connection = () => {
  const width = Dimensions.get('window').width - 16;
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
    getRoommate()
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
        setPartner([]);
      });
  }, [room_part_of]);
  useEffect(() => {
    console.log('partner:', partner);
  }, [partner]);
  return (
    <View
      className="flex-1 h-full items-center justify-center p-5"
      style={{ width, backgroundColor: theme.background }}
    >
      <Button label="POKE" onPress={pokeUser} />
      <Text className="p-5 text-xl font-bold" style={{ color: theme.text }}>
        Paired with
      </Text>
      {partner?.map((item, i) => {
        return (
          <View className="p-4" key={i}>
            <View className="gap-2 justify-between flex-row">
              <Text
                style={{ color: theme.text }}
                className="font-semibold text-xl"
              >
                Name:
              </Text>
              <Text
                style={{ color: theme.text }}
                className="font-normal text-xl"
              >
                {item?.name || ''}
              </Text>
            </View>
            <View className="gap-2 justify-between flex-row">
              <Text
                style={{ color: theme.text }}
                className="font-semibold text-xl"
              >
                Email:
              </Text>
              <Text
                style={{ color: theme.text }}
                className="font-normal text-xl"
              >
                {item?.email || ''}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default Connection;
