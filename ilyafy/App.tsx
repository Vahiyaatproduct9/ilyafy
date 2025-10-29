import './global.css';
import Main from './app/home/main';
// import { setupPlayer } from './functions/setupPlayer';
import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';
export default function App() {
  useEffect(() => {
    async () => {
      await TrackPlayer.add({
        id: 'placeholder',
        // url: 'https://software-mansion.github.io/react-native-audio-api/audio/music/example-music-01.mp3', // any short valid MP3/stream
        url: require('./data/test.mp3'),
        title: 'Always',
        artist: 'Daniel Caesar',
        artwork: require('./data/test.png'),
      });
    };
  }, []);
  return <Main />;
}
