// import notifee from '@notifee/react-native';
import { domain } from "../../path/path";
import RNFB from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import useMessage from "../../store/useMessage";
import useSocketStore from "../../store/useSocketStore";
import control from './control';
const setMessage = useMessage.getState().setMessage;
const downloadList = new Set<string>();
const sendMessage = useSocketStore.getState().sendMessage;
export default {
  async get(url: string, id: string): Promise<{
    localPath?: string;
    headers?: any;
    metadata?: any;
  } | undefined> {
    const fileExists = await RNFS.exists(`${RNFS.DocumentDirectoryPath}/${id}.aac`);
    if (fileExists) {
      console.log('File exists:', id);
      return;
    }
    if (downloadList.has(id)) {
      setMessage('Reading, Please wait...');
      console.log('Already downloading');
      return;
    }
    const serverUrl = `${domain}/stream?url=${url || ''}`;
    const localPath = `${RNFS.DocumentDirectoryPath}/${id || 'temp'}.aac`;
    console.log({ localPath });
    try {
      // if (await RNFB.fs.exists(localPath)) await RNFB.fs.unlink(localPath);
      if (!localPath) {
        console.error('FileError: path not found', localPath);
        return undefined;
      }
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
        downloadList.add(id || '');
        sendMessage({
          state: 'buffering',
        });
        task.progress({ interval: 100 }, (recieved) => {
          // console.log(`Downloaded ${recieved} bytes`);
          if (recieved >= minBuffer && !started) {
            started = true;
            console.log('song resolved:', id);
            resolve({
              localPath,
              headers,
              metadata: undefined
            });
          }
          console.log('recieved:', (recieved / (1024)).toFixed(2) + ' KB');
        });
        task.then(async res => {
          headers = await res.info().headers;
          console.log('Headers: ', headers);
          if (headers['Content-Type']?.includes('application/json')) {
            const info = await res.json();
            console.log('Info:', info);
            console.log('Meta mode:', res.path());
            // let resolved = false;
            await RNFS.downloadFile({
              fromUrl: info.url || '',
              toFile: localPath,
              background: true,
              begin: () => {
                console.log(`Downloading ${id || 'temp'}`);
                sendMessage({
                  state: 'buffering',
                });
                setMessage('Please wait, Reading Songs');
              },
              progress: _progressData => {
              }
            }).promise.then(async () => {
              console.log('Download Complete:' + id);
              resolve({ localPath: info.url, headers, metadata: info });
              await control.remotePlay();
            }).catch(err => {
              console.log('Some Error Occured: ', err);
            }).finally(() => {
              downloadList.delete(id || '');
            });
            return;
          }
          console.log('Buffer mode');
          setMessage('Reading Complete!');
          downloadList.delete(id);
          return;
        })
          .catch(err => {
            console.error('Download error:', err);
            setMessage('Ooops!')
            reject(err);
            if (!started) reject(err);
          })
      })
    } catch (error) {
      setMessage('Ooops!');
      console.error('Error in stream :(', error);
      throw error;
    }
  },
  async update(songId: string, accessToken: string): Promise<{
    localPath?: string;
    headers?: any;
    metadata?: any;
  } | undefined> {
    const updateUrl = `${domain}/stream?id=${songId}`;
    const localPath = `${RNFS.DocumentDirectoryPath}/${songId}.aac`;
    try {
      if (downloadList.has(songId)) {
        setMessage('Reading, Please wait...');
        console.log('Already downloading');
        return;
      }
      if (await RNFS.exists(localPath)) await RNFS.unlink(localPath);
      console.log('Streaming Chunks to ', localPath);
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
            resolve({ localPath, headers, metadata: undefined });
          }
        });
        task.then(async (res) => {
          headers = await res.info().headers;
          if (headers['Content-Type']?.includes('application/json')) {
            const info = await res.json();
            let resolved = false;

            await RNFS.downloadFile({
              fromUrl: info?.url || '',
              toFile: localPath,
              begin: () => {
                console.log('Download started:' + songId);
                downloadList.add(songId);
              },
              progress: _progressData => {
                // const downloaded = (progressData.bytesWritten / (1024 * 1024)).toFixed(2);
                // const total = (progressData.contentLength / (1024 * 1024)).toFixed(2);
                // console.log(`Downloaded ${downloaded} of ${total} MB.`);
                // let percent = Math.ceil(parseFloat(downloaded) / parseFloat(total) * 100);
                if (_progressData.bytesWritten >= minBuffer && !resolved) {
                  resolved = true;
                  resolve({ localPath: info.url, headers, metadata: info })
                }
                // if (percent > 100) percent = 100;
                // if (percent < 90) {
                //   notifee.displayNotification({
                //     id: songId,
                //     title: 'Reading Song',
                //     body: `Read ${downloaded} of ${total} MB.`,
                //     android: {
                //       channelId: 'downloads',
                //       smallIcon: 'ic_small_icon',
                //       ongoing: true,
                //       onlyAlertOnce: true,
                //       progress: {
                //         max: 100,
                //         current: Math.ceil(parseFloat(downloaded) / parseFloat(total) * 100),
                //       },
                //     },
                //   });
                // } else {
                //   notifee.cancelNotification(songId);
                // }
              }
            }).promise.then(() => {
              console.log('Download Complete:' + songId);
            }).catch((err) => {
              console.log('Some Error Occured: ', err);
            }).finally(() => {
              downloadList.delete(songId);
            })
            return;
          }
          setMessage('Reading Complete!');
          downloadList.delete(songId);
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
