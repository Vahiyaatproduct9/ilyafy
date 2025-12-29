import messaging, { onMessage, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { AndroidBadgeIconType, AndroidImportance } from '@notifee/react-native';
import useSongs from '../../store/useSongs';
import { songProp } from '../../types/songs';
type notificationDatatype = {
  songDetails?: string;
  event: 'playlist' | 'poke';
  code?: 'add' | 'delete';
  songId?: string;
}
export default () => {
  notifee.createChannel({
    id: 'playlist',
    name: 'Playlist',
    importance: AndroidImportance.DEFAULT,
  })
  notifee.createChannel({
    id: 'poke',
    name: 'Poke',
    importance: AndroidImportance.HIGH
  })
  notifee.createChannel({
    id: 'downloads',
    name: 'Downloads',
    importance: AndroidImportance.DEFAULT,
  })
  setBackgroundMessageHandler(messaging(), async data => {
    console.log('Background Message recieved: ', data);
    const notificationData: notificationDatatype = data.data as notificationDatatype;
    const stringDetails = notificationData?.songDetails as string;
    const songDetails = JSON.parse(stringDetails) as songProp;
    console.log('song details:', songDetails);
    if (songDetails && notificationData?.event === 'playlist' && notificationData?.code === 'add') {
      const songExists = useSongs.getState().songs.find(t => t.id === songDetails.id);
      console.log('song exist:', songExists);
      !songExists && useSongs.getState().addSong({
        ...songDetails,
        mediaId: songDetails?.id,
        artwork: songDetails?.thumbnail,
      });
    } else if (notificationData?.event === 'playlist' && notificationData?.code === 'delete') {
      const removeSong = useSongs?.getState()?.removeSong;
      await removeSong(notificationData?.songId || '')
    }
  })
  onMessage(messaging(), async data => {
    console.log('Foreground Message received: ', data);
    const notificationData = data.data as notificationDatatype;
    const stringDetails = notificationData?.songDetails || '';
    const songDetails = JSON.parse(stringDetails) as songProp;
    console.log('song details:', songDetails);
    if (songDetails && notificationData?.event === 'playlist' && notificationData?.code === 'add') {
      const songs = useSongs.getState().songs
      console.log('songs:', songs);
      const songExists = songs.find(t => t.id === songDetails.id);
      console.log('song exist:', songExists);
      !songExists && useSongs.getState().addSong({
        ...songDetails,
        mediaId: songDetails?.id,
        artwork: songDetails?.thumbnail,
      });
    } else if (notificationData?.event === 'playlist' && notificationData?.code === 'delete') {
      const removeSong = useSongs?.getState()?.removeSong;
      await removeSong(notificationData?.songId || '')
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