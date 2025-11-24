import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidBadgeIconType, AndroidImportance } from '@notifee/react-native'
export default () => {
  notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.DEFAULT
  }).then(channelId => {
    console.log('chhanelIds: ', channelId);

    messaging().onMessage(async data => {
      console.log('Foreground Message revieved: ', data);
      notifee.displayNotification({
        title: data.notification?.title,
        body: data.notification?.body,
        android: {
          channelId,
          badgeIconType: AndroidBadgeIconType.SMALL,
          smallIcon: 'ic_small_icon'
        }
      })
    });
    messaging().setBackgroundMessageHandler(async data => {
      console.log('BAckground Message recieved: ', data);
    })
  });
}