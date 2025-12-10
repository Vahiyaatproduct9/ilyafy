import messaging, { onMessage, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { AndroidBadgeIconType, AndroidImportance } from '@notifee/react-native';
import useSongs from '../../store/useSongs';
export default () => {
  notifee.createChannel({
    id: 'playlist',
    name: 'Playlist',
    importance: AndroidImportance.DEFAULT,
  })
  notifee.createChannel({
    id: 'poke',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH
  })
  setBackgroundMessageHandler(messaging(), async data => {
    console.log('Background Message recieved: ', data);
  })
  onMessage(messaging(), async data => {
    console.log('Foreground Message received: ', data);
    const stringDetails = data?.data?.songDetails;
    const songDetails = typeof stringDetails === 'string' ? JSON.parse(stringDetails) : stringDetails;
    const addSong = useSongs.getState().addSong;
    if (songDetails) {
      const track = {
        url: songDetails.url || '',
        title: songDetails.title || 'Unknown Song',
        artist: songDetails.artist || 'Ilyafy',
        artwork: songDetails.thumbnail || '',
        mediaId: songDetails.id || Date.now().toString(),
      };
      await addSong(track);
    }
    const channelId = String(data?.data?.event) || 'playlist';
    notifee.displayNotification({
      title: data.notification?.title,
      body: data.notification?.body,
      android: {
        channelId,
        badgeIconType: AndroidBadgeIconType.LARGE,
        smallIcon: 'ic_small_icon',
        importance: AndroidImportance.HIGH,
        onlyAlertOnce: channelId === 'poke',
        actions: channelId === 'poke' ? [{
          title: 'Join',
          pressAction: {
            id: 'join'
          }
        }, {
          title: 'Ignore',
          pressAction: {
            id: 'ignore'
          }
        }] : [],
      },
    })
  });
}