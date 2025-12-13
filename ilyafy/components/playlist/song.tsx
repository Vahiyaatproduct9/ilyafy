import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  AnimatedStyle,
  FadeInDown,
  FadeOutUp,
} from 'react-native-reanimated';
import Icon from '../icons/icon';
import Options from '../../assets/icons/options.svg';
import TrackPlayer, { Track } from 'react-native-track-player';
import control from '../../functions/stream/control';
import theme from '../../data/color/theme';
import { Dispatch, SetStateAction } from 'react';
const image = require('../../assets/images/background.png');
const Item = ({
  i,
  song,
  colors,
  setSelectedSong,
}: {
  i: number | null;
  song: Track;
  colors: AnimatedStyle;
  setSelectedSong: Dispatch<SetStateAction<Track | null>>;
}) => {
  const changeSong = async () => {
    console.log('song:', song);
    const queue = await TrackPlayer.getQueue();
    const index = queue.findIndex(t => t.mediaId === song?.mediaId || '');
    await control.remoteSkip(index, 0);
    await control.remotePlay();
  };
  return (
    <Pressable
      key={i}
      onPress={changeSong}
      className="w-full my-1 flex-row px-2"
    >
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutUp}
        className={'flex-row flex-1 rounded-2xl p-1'}
        style={colors}
      >
        <Image
          source={song?.artwork ? { uri: song.artwork } : image}
          className="h-20 w-20 rounded-2xl self-center"
        />
        <View className="p-3 flex-1">
          <Text className="font-semibold text-xl" style={{ color: theme.text }}>
            {song?.title || 'Unknown Song'}
          </Text>
          <Text className="font-thin text-l" style={{ color: theme.text }}>
            {song?.artist || 'Unknown Artist'}
          </Text>
        </View>
        <View className="items-center justify-center p-2">
          <Icon
            component={Options}
            onPress={() => setSelectedSong(song || null)}
            fill={theme.text}
            size={28}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default Item;
