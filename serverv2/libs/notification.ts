import { configDotenv } from 'dotenv';
configDotenv();
import admin from 'firebase-admin';
const SECRET = process.env.GOOGLE_API || '';
const serviceAccount = JSON.parse(SECRET);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

export default async ({ message, fcmToken }: {
  message: {
    title: string;
    body: string;
    data?: object;
    event: 'playlist' | 'poke';
    code?: 'delete' | 'add'
  };
  fcmToken: string;
}) => {
  return await admin.messaging().send({
    notification: {
      title: message.title,
      body: message.body,
    },
    token: fcmToken,
    data: {
      ...message.data,
      event: message.event,
      ...(message.code ? { code: message.code } : {})
    },
  })
    .then(() => {
      console.log('Notification sent!')
      return true;
    })
    .catch(() => { console.error('Some Error Occured!'); return false });
}
