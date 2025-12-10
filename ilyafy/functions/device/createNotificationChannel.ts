import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidBadgeIconType, AndroidImportance } from '@notifee/react-native'
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
  messaging().setBackgroundMessageHandler(async data => {
    console.log('Background Message recieved: ', data);
  })
  messaging().onMessage(async data => {
    console.log('Foreground Message revieved: ', data);
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