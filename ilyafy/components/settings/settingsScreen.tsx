import { View, FlatList } from 'react-native';
import React from 'react';
import useDeviceSetting from '../../store/useDeviceSetting';
import Button from '../buttons/button1';
import { useNavigation } from '@react-navigation/native';
import useConfirmScreen from '../../store/useConfirmScreen';
import useProfile from '../../store/useProfile';
import deleteUser from '../../functions/auth/deleteUser';
import useMessage from '../../store/useMessage';

const SettingsScreen = () => {
  const colors = useDeviceSetting(s => s.colors);
  const navigation = useNavigation();
  const setData = useConfirmScreen().setData;

  const buttonList = [
    {
      name: 'Sign Out',
      func: () => {
        setData({
          yesLabel: 'Sign Out',
          noLabel: 'Cancel',
          title: 'Are you sure you want to sign out?',
          yesFunction: async () => {
            const setProfile = useProfile.getState().setProfile;
            setProfile(null);
          },
          noFunction: null,
          critical: 'no',
        });
      },
    },
    {
      name: 'Delete Account',
      func: () => {
        setData({
          yesLabel: 'Delete',
          noLabel: 'Cancel',
          title: 'Are you sure you want to delete your account?',
          body: 'Your partner will unlink and all music will be deleted permanently.',
          yesFunction: async () => {
            const deleteAcc = await deleteUser();
            if (deleteAcc) {
              useMessage.getState().setMessage(deleteAcc?.message);
              const setProfile = useProfile.getState().setProfile;
              deleteAcc?.success && setProfile(null);
            }
          },

          noFunction: null,
          critical: 'yes',
        });
      },
    },
    {
      name: 'Feedback',
      func: () => {
        navigation.navigate('feedback' as never);
      },
    },
  ];
  const separator = () => <View className="w-full h-[2px] bg-slate-600" />;
  return (
    <View
      className="py-5 w-full h-full"
      style={{
        backgroundColor: colors?.background,
      }}
    >
      <FlatList
        data={buttonList}
        renderItem={({ index, item }) => (
          <Button
            key={index}
            onPress={item.func}
            containerStyle={{ backgroundColor: colors?.secondary }}
            label={item.name}
            textStyle={{ color: colors.text }}
            containerClassName="w-full p-4 min-h-[60px] items-start justify-center"
            textClassName="text-l font-normal"
          />
        )}
        ItemSeparatorComponent={separator}
      />
    </View>
  );
};

export default SettingsScreen;
