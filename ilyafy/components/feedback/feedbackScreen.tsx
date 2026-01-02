import { View, Text, TextInput, Switch } from 'react-native';
import React, { useState } from 'react';
import useDeviceSetting from '../../store/useDeviceSetting';
import Button from '../buttons/button1';
import post from '../../api/feedback/post';
import showToast from '../message/toast';

const FeedbackScreen = () => {
  const colors = useDeviceSetting(s => s.colors);
  const [value, setValue] = useState<string>('');
  const [anonymous, setAnonymous] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const submitFeeback = async () => {
    setLoading(true);
    const response = await post({
      body: value,
      anonymous,
    });
    if (response?.success) {
      showToast('Feedback submitted successfully!');
      setValue('');
    } else {
      showToast(response?.message || 'Something went wrong!');
    }
    setLoading(false);
  };

  return (
    <View
      className="p-5 w-full h-full"
      style={{
        backgroundColor: colors.background,
      }}
    >
      <Text className="font-normal text-xl" style={{ color: colors.text }}>
        What do you think of Ilyafy?
      </Text>
      <TextInput
        className="border-2 color-white mt-6 border-[rgba(100,100,100,1)] rounded-2xl p-5 h-[120]"
        multiline
        placeholder="I feel like ..."
        textAlignVertical="top"
        numberOfLines={6}
        value={value}
        onChangeText={setValue}
      />
      <View className='flex-row items-center self-end mt-4'>
        <Text style={{color: colors.text}} className='mr-2'>Stay Anonymous</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={anonymous ? colors.primary : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setAnonymous(previousState => !previousState)}
          value={anonymous}
        />
      </View>
      <Button
        label="Submit"
        onPress={submitFeeback}
        containerClassName="absolute self-center items-center bottom-10 w-full rounded-2xl p-6"
        // eslint-disable-next-line react-native/no-inline-styles
        containerStyle={{
          backgroundColor: colors.primary,
          opacity: value.length > 0 ? 1 : 0.5,
        }}
        disabled={value.length === 0 || loading}
        loading={loading}
        textStyle={{
          color: colors.text,
        }}
        textClassName="text-xl"
      />
    </View>
  );
};

export default FeedbackScreen;
