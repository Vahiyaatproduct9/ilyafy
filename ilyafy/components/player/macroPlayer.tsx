import { View, Text, Dimensions } from 'react-native';
import React, { RefObject, useEffect, useRef } from 'react';
import Animated, {
  AnimatedStyle,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import theme from '../../data/color/theme';
import { Image } from 'react-native';
import Icon from '../icons/icon';
import Play from '../../assets/icons/play.svg';
// import Pause from '../../assets/icons/pause.svg';
import Next from '../../assets/icons/next.svg';
import Previous from '../../assets/icons/previous.svg';
// import Playlist from '../../assets/icons/playlist.svg';
import {
  Gesture,
  GestureDetector,
  GestureType,
  PanGesture,
} from 'react-native-gesture-handler';
import useCurrentTrack from '../../store/useCurrentTrack';
import TrackPlayer, { Event } from 'react-native-track-player';

const MacroPlayer = (props: {
  style?: AnimatedStyle;
  panGesture: PanGesture;
  refProp: RefObject<GestureType | undefined>;
}) => {
  const { width } = Dimensions.get('screen');
  const progressRef = useRef<GestureType | undefined>(undefined);
  const controlGesture = Gesture.Pan()
    .simultaneousWithExternalGesture(progressRef).withRef(props.refProp);
  const { track, position } = useCurrentTrack();
  const setSong = async () => {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      url: require('../../data/test.mp3'),
      // url: 'https://rr6---sn-ci5gup-cvhez.googlevideo.com/videoplayback?expire=1764169400&ei=WMImaY-3DNmd4t4PnvqrsAs&ip=2401%3A4900%3A3828%3A8a71%3A8b62%3Ab140%3Ae914%3A4e29&id=o-AEWcrXrXVYu3WcQqcNZjLS2DwuLfYu2lMDl3nN0-FLp_&itag=139&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=0&rms=au%2Cau&gcr=in&bui=AdEuB5RKBLMJprK9RCYL4Rh3m4G6v7dYvt6dCEMJLWnLpWJ6fqQVHOf-WHC6b-OW9Fm3PSqjOPWl9yxx&spc=6b0G_AYWzn2J&vprv=1&svpuc=1&mime=audio%2Fmp4&rqh=1&gir=yes&clen=1080269&dur=176.854&lmt=1589823322800895&keepalive=yes&fexp=51552689,51565116,51565682,51580968&c=ANDROID&txp=5531432&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cgcr%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhAJhhoSI-5JOlMJZnw9kl2_5FxFCkk8-743yomRTWU6KuAiBR0amt8bUpQV7g4EtKWvDtj3byDkPWPFuffIZ5IpgGEw%3D%3D&redirect_counter=1&cm2rm=sn-ci5gup-jj0r7z&rrc=191&req_id=e8b7c9968a1a3ee&cms_redirect=yes&cmsv=e&met=1764147926,&mh=3T&mm=29&mn=sn-ci5gup-cvhez&ms=rdu&mt=1764147654&mv=m&mvi=6&pl=48&lsparams=cps,met,mh,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRQIgDuIuc5S4Bjy7814XEy3DK7LZeBf6RCrZnHlFdEjV0eACIQD98DlwbTt2umPC76RI1_Xek6L84jY5pHs9jXdZO_tJQg%3D%3D',
      title: 'Always',
      artist: 'Daniel Caesar',
      artwork: require('../../data/test.png'),
    });
    await TrackPlayer.play();
  };

  return (
    <Animated.View
      className={'absolute overflow-hidden'}
      style={[
        props.style,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          backgroundColor: theme.primary,
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
        },
      ]}
    >
      <View className="w-full p-2 items-center">
        <Text className="text-xl" style={{ color: theme.text }}>
          {position || 'lol'}
        </Text>
      </View>
      <View className="w-full gap-5 p-1 flex-1 items-center justify-center">
        <Image
          source={require('../../assets/images/background.png')}
          className="w-full rounded-[32px]"
          style={{
            height: width,
          }}
        />
        <GestureDetector gesture={controlGesture}>
          <Animated.View className="w-full p-2">
            <View className="w-full p-2">
              <Text
                className="font-semibold text-2xl"
                style={{ color: theme.text }}
              >
                {track?.title || 'Unknown Song'}
              </Text>
              <Text className="text-xl font-thin" style={{ color: theme.text }}>
                {track?.artist || 'Unknown Artist'}
              </Text>
            </View>
            <ProgressBar refProp={progressRef} />
            <View className="flex-row p-2 w-full justify-center gap-10">
              <Icon
                component={Previous}
                size={40}
                fill="white"
                onPress={async () => await TrackPlayer.seekTo(45)}
                className="border-2 border-white p-2"
              />
              <Icon
                component={Play}
                size={40}
                onPress={setSong}
                fill="white"
                className="border-2 border-white p-2"
              />
              <Icon
                component={Next}
                size={40}
                fill="white"
                className="border-2 border-white p-2"
              />
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
};

export default MacroPlayer;

const ProgressBar = (props: {
  refProp: RefObject<GestureType | undefined>;
}) => {
  const { initializePlayer, duration, position: tPosition } = useCurrentTrack();
  const { width } = Dimensions.get('window');
  useEffect(() => {
    initializePlayer();
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, d =>
      console.log('progress updated: ', d),
    );
    console.log(tPosition);
  }, []);

  const position = useSharedValue(0);
  useEffect(() => {
    let percentage = (tPosition || 0) / (duration || 1);
    position.value = withTiming(percentage * (width - 16), { duration: 1000 });
  }, [duration, position, tPosition, width]);
  const seekSongTo = async (i: number) => {
    await TrackPlayer.seekTo(i);
    console.log('Song Seeked!')
  }
  const gestureHandler = Gesture.Pan()
    .onUpdate(e => {
      console.log('data: ', e.x);
      position.value = e.absoluteX;
    })
    .onEnd(e => {
      let pos;
      if (e.absoluteX < 8) pos = 0;
      else if (e.absoluteX > width - 8) pos = duration || 0;
      else pos = e.absoluteX;
      const percentage = pos / (width - 16);

      const progress = percentage * (duration || 0);
      runOnJS(seekSongTo)(progress)

    })
    .withRef(props.refProp);
  const gestureTapHandler = Gesture.Tap().onBegin(async e => {
    position.value = withSpring(e.absoluteX);
    let pos;
    if (e.absoluteX < 8) pos = 0;
    else if (e.absoluteX > width - 8) pos = duration || 0;
    else pos = e.absoluteX;
    const percentage = pos / (width - 16);
    const progress = percentage * (duration || 0);
    runOnJS(seekSongTo)(progress)
  });
  const combined = Gesture.Simultaneous(gestureHandler, gestureTapHandler);
  const rProgressStyle = useAnimatedStyle(() => {
    return {
      width: position.value,
    };
  });
  return (
    <GestureDetector gesture={combined}>
      <Animated.View className={'h-4 w-full'}>
        <Animated.View
          className="h-2 w-full rounded-xl overflow-hidden"
          style={{ backgroundColor: theme.secondary }}
        >
          <Animated.View
            className={'bg-slate-600 flex-1 p-1 rounded-xl'}
            style={[rProgressStyle]}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
