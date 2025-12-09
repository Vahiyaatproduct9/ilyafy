import { Image, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import theme from '../../data/color/theme';
import Icon from '../icons/icon';
import Options from '../../assets/icons/options.svg';
import TrackPlayer, { Track } from 'react-native-track-player';
const image = require('../../assets/images/background.png');
const Item = ({
  i,
  song,
  showOptionsOf,
}: {
  i: number | null;
  song: Track;
  showOptionsOf: (i: string) => void;
}) => {
  const changeSong = async () => {
    console.log('song:', song);
    console.log('Song Changed!');
    const queue = await TrackPlayer.getQueue();
    console.log('Queue:', queue);
    const index = queue.findIndex(t => t.mediaId === song?.mediaId || '');
    console.log('index:', index);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
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
        style={{ backgroundColor: theme.primary }}
      >
        <Image
          source={song?.artwork ? { uri: song.artwork } : image}
          className="h-20 w-20 rounded-2xl self-center "
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
            onPress={() => showOptionsOf(song.id)}
            fill={theme.text}
            size={28}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default Item;
