/**
 * @format
 */
import { AppRegistry } from 'react-native';
import App from './App';
import createNotificationChannel from './functions/device/createNotificationChannel';
import { name as appName } from './app.json';
import TrackPlayer from 'react-native-track-player';
import service from './functions/service';
import setupPlayer from './functions/setupPlayer';
AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => service);
setupPlayer();
createNotificationChannel();
