import { View, Text, Dimensions, TextInput } from 'react-native';
import React, { useState } from 'react';
import theme from '../../data/color/theme';
import Button from '../../components/buttons/button1';
import { FadeInDown, FadeOutDown } from 'react-native-reanimated';

const Invitation = () => {
  const width = Dimensions.get('window').width - 16;
  const [value, setValue] = useState<string>('');
  const showButton = value.length > 3;
  return (
    <View
      className="flex-1 h-full items-center justify-center p-5"
      style={{ width, backgroundColor: theme.background }}
    >
      <Text
        className="absolute self-center top-10 font-light text-2xl"
        style={{ color: theme.text }}
      >
        Who do you wanna pair up with?
      </Text>
      <Text
        className="mt-2 text-xl font-semibold"
        style={{ color: theme.text }}
      >
        Enter their Email here!
      </Text>
      <TextInput
        className="border-2 min-w-24 rounded-2xl py-2 px-5 text-xl"
        style={{ color: theme.text, borderColor: theme.primary }}
        textAlign="center"
        textAlignVertical="center"
        keyboardType="email-address"
        returnKeyType="search"
        selectionColor={'pink'}
        value={value}
        onChangeText={setValue}
      />
      {showButton && (
        <Button
          label="Look"
          entering={FadeInDown.duration(250)}
          exiting={FadeOutDown.duration(250)}
          containerClassName="self-end px-10 py-2 rounded-xl"
          containerStyle={{
            backgroundColor: theme.primary,
          }}
          textClassName="text-2xl"
          textStyle={{ color: theme.text }}
        />
      )}
    </View>
  );
};

export default Invitation;
