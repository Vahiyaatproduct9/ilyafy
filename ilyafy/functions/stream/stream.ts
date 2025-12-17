// import notifee from '@notifee/react-native';
import { domain } from "../../path/path";
import RNFB from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import useMessage from "../../store/useMessage";
import useSocketStore from "../../store/useSocketStore";
import control from './control';
import useSongs from "../../store/useSongs";
const setMessage = useMessage.getState().setMessage;
const downloadList = new Set<string>();
const sendMessage = useSocketStore.getState().sendMessage;
const setLoading = useSongs.getState().setLoading;
export default {
  async get(url: string, id: string): Promise<{
    localPath?: string;
    headers?: any;
    metadata?: any;
  } | undefined> {
    setLoading(true);
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
    const tempPath = `${RNFS.CachesDirectoryPath}/${id || 'temp'}.aac`;
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
      let repeats: number = 0;
      const minBuffer = 256 * 1024 // 256kb
      return new Promise((resolve, reject) => {
        const task = RNFB.config({
          path: tempPath,
          fileCache: true,
          overwrite: true,
        }).fetch('GET', serverUrl);
        downloadList.add(id || '');
        sendMessage({
          state: 'buffering',
        });
        task.progress({ interval: 100 }, (recieved) => {
          repeats++;
          // console.log(`Downloaded ${recieved} bytes`);
          if (repeats === 20 && !started) {
            started = true;
            console.log('song resolved:', id);
          }
          console.log('recieved:', (recieved / (1024)).toFixed(2) + ' KB');
        });
        task.then(async res => {
          headers = await res.info().headers;
          console.log('Headers: ', headers);
          const isJson = headers['Content-Type']?.includes('application/json') || headers['content-type']?.includes('application/json');

          if (isJson) {
            const fileContent = await RNFS.readFile(tempPath, 'utf8');
            const info = JSON.parse(fileContent);
            console.log('Redirecting to:', info?.url);
            console.log('Meta mode:', res.path());
            let resolved = false;
            const downloadFile = RNFB.config({
              fileCache: true,
              path: localPath,
              overwrite: true
            }).fetch('GET', info?.url)
            await control.remoteBuffer();
            downloadFile.progress({ interval: 100 }, res => {
              downloadList.add(id);
              if (res >= minBuffer && !resolved) {
                console.log('downloaded: ', res / 1024, 'KB')
                resolve({ localPath, headers, metadata: info });
              }
            })
            downloadFile.then(() => {
              console.log('Download Complete!');
              setMessage('Reading Complete!');
              control.remotePlay();
              downloadList.delete(id);
            }).catch(err => {
              console.log('Error:', err);
              setMessage('Some Error Occured :(');
            }).finally(async () => {
              await RNFS.unlink(tempPath);
            })
            setLoading(false);
            return;
          }
          console.log('Buffer mode');
          setMessage('Reading Complete!');
          await RNFS.copyFile(tempPath, localPath)
            .then(() => {
              resolve({
                localPath,
                headers,
                metadata: undefined
              });
              RNFS.unlink(tempPath);
            }, err => {
              console.log('Error copying:', err);
              reject(err);
            }).catch(err => {
              console.log('Error copying:', err);
              reject(err);
            })
          downloadList.delete(id);
          setLoading(false);
        })
          .catch(err => {
            console.error('Download error:', err);
            setMessage('Ooops!')
            reject(err);
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
    setLoading(true);
    const updateUrl = `${domain}/stream?id=${songId}`;
    const localPath = `${RNFS.DocumentDirectoryPath}/${songId}.aac`;
    const tempPath = `${RNFS.CachesDirectoryPath}/${songId}.aac`;
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
      let repeats: number = 0;
      const minBuffer = 256 * 1024; // 256kb
      return new Promise((resolve, reject) => {
        const task = RNFB.config({
          path: tempPath,
          overwrite: true,
          fileCache: true,
        }).fetch('PATCH', updateUrl, {
          Authorization: `Bearer ${accessToken}`
        });
        task.progress({ interval: 100 }, (recieved) => {
          console.log(`Updated ${recieved} bytes.`);
          // if (recieved >= minBuffer && !started) {
          if (repeats === 20 && !started) {
            started = true;
            console.log('Buffering update!');
          }
        });
        task.then(async res => {
          headers = await res.info().headers;
          const isJson = headers['Content-Type']?.includes('application/json') || headers['content-type']?.includes('application/json');
          if (isJson) {
            const fileContent = await RNFS.readFile(tempPath);
            const info = JSON.parse(fileContent);
            console.log('info:', info)
            let resolved = false;
            const downloadFile = RNFB.config({
              fileCache: true,
              path: localPath,
              overwrite: true
            }).fetch('GET', info?.url)
            control.remoteBuffer();
            downloadFile.progress({ interval: 100 }, res => {
              downloadList.add(songId);
              if (res >= minBuffer && !resolved) {
                console.log('downloaded: ', res / 1024, 'KB')
                resolve({ localPath, headers, metadata: info });
              }
            })
            downloadFile.then(() => {
              console.log('Download Complete!');
              downloadList.delete(songId);
              control.remotePlay();
            }).catch(err => {
              console.log('Error:', err);
              setMessage('Some Error Occured :(');
              reject(err);
            })
              .finally(async () => {
                await RNFS.unlink(tempPath)
              })
            setLoading(false);
            return;
          }
          setMessage('Reading Complete!');
          downloadList.delete(songId);
          await RNFS.copyFile(tempPath, localPath)
            .then(() => {
              resolve({ localPath, headers, metadata: undefined });
              RNFS.unlink(tempPath)
            }, (err) => {
              reject(err);
              console.log('Error updating:', err);
            }).catch(err => {
              reject(err);
              console.log('Error updating:', err);
            })
          setLoading(false);
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
