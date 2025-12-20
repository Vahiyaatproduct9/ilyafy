import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  AnimatedStyle,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from '../icons/icon';
import Options from '../../assets/icons/options.svg';
import TrackPlayer, { Track } from 'react-native-track-player';
import control from '../../functions/stream/control';
import theme from '../../data/color/theme';
import { Dispatch, SetStateAction } from 'react';
import useSongs from '../../store/useSongs';
const image = require('../../assets/images/background.png');
import strip from '../../functions/miscellanous/stripWords';
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
    if (index === -1) {
      await TrackPlayer.reset().then(async () => {
        const songList = useSongs?.getState()?.songs;
        TrackPlayer.add(songList);
        await TrackPlayer.skip(
          songList?.findIndex(t => t.mediaId === song?.mediaId || ''),
        );
      });
      await TrackPlayer.play();
      return;
    }
    await control.remoteSkip(index, 0);
    await control.remotePlay();
  };
  const sizeValue = useSharedValue(1);
  const animatedButton = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: sizeValue.value,
        },
      ],
    };
  });
  const AP = Animated.createAnimatedComponent(Pressable);
  return (
    <AP
      key={i}
      onPressIn={() => (sizeValue.value = withTiming(0.96, { duration: 250 }))}
      onPressOut={() => (sizeValue.value = withTiming(1, { duration: 250 }))}
      onPress={changeSong}
      className="w-full my-[2px] flex-row px-2"
      style={animatedButton}
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
        <View className="p-2 flex-1 justify-evenly">
          <Text
            className="font-semibold text-[16px]"
            style={{ color: 'white' }}
          >
            {strip(song?.title || 'Unknown Song')}
          </Text>
          <Text className="font-thin text-l" style={{ color: 'white' }}>
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
    </AP>
  );
};

export default Item;
