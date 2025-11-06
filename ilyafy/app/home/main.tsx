import '../../global.css';
import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import TrackPlayer, { Event, State } from 'react-native-track-player';
import saveAndStream from '../../functions/saveAndStream';
const Main = () => {
  const sendMsg = async () => {
    // await TrackPlayer.add({
    //   id: 'placeholder',
    //   // url: 'file:///data/user/0/com.ilyafy/cache/1761797489062.aac',
    //   // url: require('../../data/test.mp3'),
    //   url: 'https://rr1---sn-a5meknzr.googlevideo.com/videoplayback?expire=1762436351&ei=n1AMaaXCEf_AsfIPv_mOuQI&ip=142.111.48.253&id=o-AJ8pS37evQ4BHKm_dczqW0vlkjuEzHZ_0aB2ElPn4EKY&itag=139&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=7&met=1762414751%2C&mh=ZY&mm=31%2C26&mn=sn-a5meknzr%2Csn-o097znsl&ms=au%2Conr&mv=m&mvi=1&pl=24&rms=au%2Cau&pcm2=no&initcwndbps=1275000&bui=AdEuB5QpBHbhkQrxWPIHKartT5Rri0FiaHGDYxK0AzbEV-7-sKjPdYGynLe_8lU01gLorMo0HIppkg6Q&spc=6b0G_GiI2hqPudmi2jdH&vprv=1&svpuc=1&mime=audio%2Fmp4&rqh=1&gir=yes&clen=1071772&dur=175.542&lmt=1759243353445592&mt=1762414202&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5532534&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgW5x3jlZrn0Ucrn6NF4fm9FJSYUHRAthhLpJJpr0XgIoCIQCeqHIq5x2TSuK4i-DtyRPy_85AJf3oZ40PPiU_Pc3Tag%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRgIhAJG5zA__IvQvc9a3etaYxfzpPZJU6vTBLTt62hRTeWNbAiEAwmRCJ99WEaPo_1I5zZ3AsrQo5Yttd9nPzBZIuep7Tws%3D',
    //   title: 'Always',
    //   artist: 'Daniel Caesar',
    //   artwork: require('../../data/test.png'),
    // });
    const task = await saveAndStream(
      'https://youtu.be/jfjXJpUNayg?si=zGVN9eKvt1CntJMh',
      // 'https://youtu.be/pOS3vCY-4kw?si=kaY3QiqyJMRbevDv',
      // 'https://youtu.be/rScwLoES2bM?si=YOSMQyhVGQtpKnk1',
      // 'https://youtu.be/xnP7qKxwzjg?si=kbOCKZEELlctlZZe',
    );
    const path = task?.localPath;
    const headers = task?.headers;
    const metadata = task?.metadata;
    const isStreamed =
      path?.startsWith('https://') || path?.startsWith('http://') || false;
    console.log('task: ', task);
    if (path) {
      await TrackPlayer.add({
        id: `${(await TrackPlayer.getQueue()).length + 1}`,
        url: isStreamed ? path : `file://${path}`,
        title: isStreamed
          ? metadata?.title
          : headers['X-Track-Title'] || 'Streamed Audio',
        artist: isStreamed
          ? metadata?.artist
          : headers['X-Track-Artist'] || 'Ilyafy',
        artwork: isStreamed
          ? metadata?.thumbnail
          : headers['X-Track-Thumbnail'] || require('../../data/test.png'),
        duration: isStreamed
          ? metadata?.duration
          : parseInt(headers['X-Duration'], 10) || undefined,
      });
      await TrackPlayer.play();
    }
    const queue = await TrackPlayer.getQueue();
    console.log({ queue });
  };
  const [message, setMessage] = useState<string>('mera ghee nikaal do');
  useEffect(() => {
    TrackPlayer.addEventListener(Event.PlaybackState, state => {
      if (state.state === State.Buffering || state.state === State.Loading) {
        setMessage('arey yaar load horha');
      } else {
        setMessage('Notification Check kijiye');
      }
    });
  }, []);
  return (
    <View className="bg-slate-500 items-center flex-1 justify-center">
      <Text className="text-3xl font-bold text-blue-200">Hiiee Loveee!</Text>
      <Pressable
        className="bg-slate-400 py-3 px-10 rounded-xl"
        onPress={sendMsg}
      >
        <Text className="font-semibold text-xl color-blue-300">{message}</Text>
      </Pressable>
    </View>
  );
};

export default Main;
