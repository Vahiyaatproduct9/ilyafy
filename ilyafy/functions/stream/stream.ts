import notifee from '@notifee/react-native';
import { domain } from "../../path/path";
import RNFB from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import useMessage from "../../store/useMessage";
import useSocketStore from "../../store/useSocketStore";
import TrackPlayer from "react-native-track-player";
const setMessage = useMessage.getState().setMessage;
const downloadList = new Set<string>();
const sendMessage = useSocketStore.getState().sendMessage;
export default {
  async get(url: string, id?: string): Promise<{
    localPath?: string;
    headers?: any;
    metadata?: any;
  } | undefined> {
    const serverUrl = `${domain}/stream?url=${id || url}`;
    const localPath = `${RNFB.fs.dirs.CacheDir}/${id || 'temp'}.aac`;
    try {
      if (await RNFB.fs.exists(localPath)) await RNFB.fs.unlink(localPath);
      console.log('Streaming Chunks to ', localPath);
      let started = false;
      let headers: any = null;
      const minBuffer = 256 * 1024 // 256kb
      return new Promise((resolve, reject) => {
        const task = RNFB.config({
          path: localPath,
          fileCache: true,
          appendExt: 'aac',
        }).fetch('GET', serverUrl);
        task.progress({ interval: 100 }, (recieved) => {
          console.log(`Downloaded ${recieved} bytes`);
          if (recieved >= minBuffer && !started) {
            started = true;
            console.log('Buffering...');
          }
        });
        const parmanentPath = `${RNFS.DocumentDirectoryPath}/${id || Date.now().toString()}.aac`;
        task.then(async res => {
          headers = await res.info().headers;
          console.log('Headers: ', headers);
          if (headers['Content-Type'].includes('application/json')) {
            const info = await res.json();
            console.log('Info:', info);
            console.log('Meta mode:', res.path());
            let resolved = false;
            let minBuffer = 1024 * 256 // 256kB
            await RNFS.downloadFile({
              fromUrl: info.url || '',
              toFile: parmanentPath,
              background: true,
              begin: () => {
                console.log('Download started!');
                sendMessage({
                  state: 'buffering',
                });
                setMessage('Reading Song...');
              },
              progress: progressData => {
                const downloaded = (progressData.bytesWritten / (1024 * 1024)).toFixed(2);
                const total = (progressData.contentLength / (1024 * 1024)).toFixed(2);
                console.log(`Downloaded ${downloaded} of ${total} MB.`);
                let percent = Math.ceil(parseFloat(downloaded) / parseFloat(total) * 100);
                if (progressData.bytesWritten >= minBuffer && !resolved) {
                  resolved = true;
                  resolve({ localPath: info.url, headers: { ...headers, filePath: parmanentPath }, metadata: info })
                }
                if (percent > 100) percent = 100;
                if (percent < 90) {
                  notifee.displayNotification({
                    id: 'reading-song',
                    title: 'Reading Song',
                    body: `Read ${downloaded} of ${total} MB.`,
                    android: {
                      channelId: 'downloads',
                      smallIcon: 'ic_small_icon',
                      ongoing: true,
                      onlyAlertOnce: true,
                      progress: {
                        max: 100,
                        current: Math.ceil(parseFloat(downloaded) / parseFloat(total) * 100),
                      },
                    },
                  });
                } else {
                  notifee.cancelNotification('reading-song');
                }
              }
            }).promise.then(async () => {
              console.log('Download Complete!');
              await TrackPlayer.play();
            }).catch(err => {
              console.log('Some Error Occured: ', err);
            });
            return;
          }
          console.log('Buffer mode');
          await RNFS.copyFile(localPath, parmanentPath);
          // if (await RNFB.fs.exists(localPath)) RNFB.fs.unlink(localPath);
          resolve({
            localPath: res.path(),
            headers: { ...headers, filePath: parmanentPath },
            metadata: undefined
          });
          return;
        })
          .catch(err => {
            console.error('Download error:', err);
            setMessage('Ooops!')
            if (!started) reject(err);
          })
      })
    } catch (error) {
      setMessage('Ooops!');
      console.error('Error in stream :(', error);
    }
  },
  async update(songId: string, accessToken: string): Promise<{
    localPath?: string;
    headers?: any;
    metadata?: any;
  } | undefined> {
    const updateUrl = `${domain}/stream?id=${songId}`;
    const localPath = `${RNFB.fs.dirs.CacheDir}/${songId}.aac`;
    const parmanentPath = `${RNFS.DocumentDirectoryPath}/${songId}.aac`;
    try {
      if (downloadList.has(songId)) {
        setMessage('Reading, Please wait...');
        console.log('Already downloading');
        return;
      }
      if (await RNFS.exists(parmanentPath)) await RNFS.unlink(parmanentPath);
      console.log('Streaming Chunks to ', parmanentPath);
      let started = false;
      let headers: any = null;
      const minBuffer = 256 * 1024; // 256kb
      return new Promise((resolve, reject) => {
        const task = RNFB.config({
          path: localPath,
          overwrite: true,
          fileCache: true,
          appendExt: 'aac'
        }).fetch('PATCH', updateUrl, {
          Authorization: `Bearer ${accessToken}`
        });
        task.progress({ interval: 100 }, (recieved) => {
          console.log(`Updated ${recieved} bytes.`);
          if (recieved >= minBuffer && !started) {
            started = true;
            console.log('Buffering update!');
          }
        });
        task.then(async (res) => {
          headers = await res.info().headers;
          if (headers['Content-Type'].includes('application/json')) {
            const info = await res.json();
            let resolved = false;

            await RNFS.downloadFile({
              fromUrl: info?.url || '',
              toFile: parmanentPath,
              begin: () => {
                console.log('Download started!');
                downloadList.add(songId);
              },
              progress: progressData => {
                const downloaded = (progressData.bytesWritten / (1024 * 1024)).toFixed(2);
                const total = (progressData.contentLength / (1024 * 1024)).toFixed(2);
                console.log(`Downloaded ${downloaded} of ${total} MB.`);
                let percent = Math.ceil(parseFloat(downloaded) / parseFloat(total) * 100);
                if (progressData.bytesWritten >= minBuffer && !resolved) {
                  resolved = true;
                  resolve({ localPath: info.url, headers: { ...headers, filePath: parmanentPath }, metadata: info })
                }
                if (percent > 100) percent = 100;
                if (percent < 90) {
                  notifee.displayNotification({
                    id: songId,
                    title: 'Reading Song',
                    body: `Read ${downloaded} of ${total} MB.`,
                    android: {
                      channelId: 'downloads',
                      smallIcon: 'ic_small_icon',
                      ongoing: true,
                      onlyAlertOnce: true,
                      progress: {
                        max: 100,
                        current: Math.ceil(parseFloat(downloaded) / parseFloat(total) * 100),
                      },
                    },
                  });
                } else {
                  notifee.cancelNotification(songId);
                }
              }
            }).promise.then(() => {
              console.log(('Download Complete!'));
            }).catch((err) => {
              console.log('Some Error Occured: ', err);
            }).finally(() => {
              downloadList.delete(songId);
            })
            return;
          }
          await RNFS.copyFile(res.path(), parmanentPath);
          // if (await RNFB.fs.exists(localPath)) RNFB.fs.unlink(localPath);
          resolve({ localPath: res.path(), headers: { ...headers, filePath: parmanentPath }, metadata: undefined });
          return;
        })
          .catch(err => {
            console.log('Updating Error');
            setMessage('Ooops!');
            reject(err);
          })
      })
    } catch (error) {
      setMessage('Ooops!')
      console.log('Updating Error:', error);
    }
  }
}