import mongoose, { Schema } from 'mongoose';
import { configDotenv } from 'dotenv';
import mailto from './mailer';
configDotenv();
const MONGODB_URL = process.env.MONGODB_URL;
const mongooseLogger = async () => {
  await mongoose.connect(MONGODB_URL || '', {
    appName: 'Ilyafy',
  });
}

mongooseLogger().catch(err => {
  console.log('Some Error Occured:', err);
  mailto({
    to: process.env.ADMIN_EMAIL,
    subject: 'Error while connecting to MongoDB.',
    html: `${err}`,
    attachments: [{
      filename: 'Error.txt',
      content: String(err)
    }],
  })
})

enum logType {
  'error',
  'warning'
}

const logSchema = new Schema({
  time: String,
  log: String,
  type: ['error', 'warning']
});
const MongoLog = mongoose.model('MongoLog', logSchema);

async function logErr(log: string) {
  const Log = new MongoLog({
    time: new Date().toLocaleString(),
    log,
    type: logType.error
  });
  await Log.save().then(() => {
    return {
      success: true
    }
  }).catch(err => {
    throw new Error(err);
  });
}
async function logWarn(log: string) {
  const Log = new MongoLog({
    time: new Date().toLocaleString(),
    log,
    type: logType.warning
  })
  await Log.save().then(() => {
    return {
      success: true
    }
  }).catch(err => {
    throw new Error(err);
  })
}
export default mongooseLogger;
export {
  logWarn, logErr
}