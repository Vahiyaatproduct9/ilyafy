// import notifee from '@notifee/react-native';
import { domain } from "../../path/path";
import RNFB from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import useMessage from "../../store/useMessage";
import control from './control';
import NewPipeModule from "../../modules/NewPipeModule";
import useSongs from "../../store/useSongs";
import useDeviceSetting from "../../store/useDeviceSetting";
import { CTrack } from "../../types/songs";
const setMessage = useMessage?.getState()?.setMessage;
const downloadList = new Set<string>();
const downloadMap = new Map<string, string>();
const minBuffer = 256 * 1024 // 256kb
const thumbnail = require('../../assets/images/background.png');
let smoothedSpeed = 0;
const ALPHA = 0.3;
type resolvedPromise = {
  localPath?: string;
  headers?: any;
  metadata?: any;
} | undefined;
export default {
  async get(url: string, id: string): Promise<resolvedPromise> {
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
      if (!localPath) {
        console.error('FileError: path not found', localPath);
        return undefined;
      }
      console.log('Streaming Chunks to ', localPath);
      let started = false;
      let headers: any = null;
      let repeats: number = 0;
      return new Promise((resolve, reject) => {
        const task = RNFB.config({
          path: tempPath,
          fileCache: true,
          overwrite: true,
        }).fetch('GET', serverUrl);
        downloadList.add(id || '');
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
            }).fetch('GET', info?.url);
            await control.remoteBuffer();
            downloadFile.progress({ interval: 100 }, res => {
              downloadList.add(id);
              console.log('downloaded: ', res / 1024, 'KB of ', id);
              if (res >= minBuffer && !resolved) {
                resolved = true;
                resolve({ localPath, headers, metadata: info });
              }
            })
            downloadFile.then(() => {
              console.log('Download Complete!');
              setMessage('Reading Complete!');
              downloadList.delete(id);
            }).catch(err => {
              console.log('Error:', err);
              setMessage('Some Error Occured :(');
            }).finally(async () => {
              await RNFS.unlink(tempPath);
            })
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
  async localGet(ytUrl: string, id: string, state: 'get' | 'update' = 'get'): Promise<resolvedPromise> {

    if (downloadList.has(id)) {
      setMessage('Reading, Please wait...');
      console.log('Already downloading');
      return undefined;
    };
    const localPath = `${RNFS.CachesDirectoryPath}/${id || 'temp'}.aac`;
    const fileExists = await RNFS.exists(localPath);
    if (state === 'get' && fileExists) {
      console.log('File Exists:', localPath);
      return { localPath };
    }
    try {
      if (!localPath) {
        console.error('FileError: path not found', localPath);
        return undefined;
      }
      const response = await NewPipeModule.extractStream(ytUrl);
      console.log('Fetch Response: ', response)
      if (!response) {
        return await this.get(ytUrl, id);
      }
      let resolved = false;
      return new Promise((resolve, reject) => {
        downloadList.add(id);
        const task = RNFB.config({
          path: localPath,
          fileCache: true,
          overwrite: true
        }).fetch('GET', response?.audioStream?.url || '');
        function handleResolve() {
          if (resolved) return;
          console.log("Not resolved, resolving");
          resolved = true;
          const resolveResponse = {
            localPath,
            metadata: {
              ...response,
              thumbnail: response?.thumbnailUrl || '',
              title: response?.title || 'Unknown Song',
              artist: response?.uploader || 'Ilyafy',
              url: response?.audioStream?.url || '',
            },
            headers: undefined
          };
          console.log("resolve response:", resolveResponse);
          resolve(resolveResponse);
        }
        task.progress({ interval: 500 }, (rec, total) => {
          console.log("Downloaded", rec / 1024, "of", total / 1024, "KB from", id);
          if (rec >= minBuffer && !resolved) {
            handleResolve();
          }
        })
        task.then(() => {
          console.log('Download Complete!');
          setMessage('Reading Complete!');
          handleResolve();
        }, (err) => {
          reject(new Error(err));
          setMessage('Some Error Occured!');
          console.log("local fetch error : ", err)
        }).catch(err => {
          console.log("Error:", err);
          setMessage('Some Error Occured :(');
          resolved = true;
          reject(err)
        }).finally(() => {
          downloadList.delete(id);
        })
      })
    } catch (error) {
      setMessage('Ooops!' + error);
      console.error('Error in stream :(', error);
      throw error;
    }
  },
  async fetchAndDownload(song: CTrack, url: string) {
    const filePath = await this.downloadSong(url, song?.mediaId!);
    if (typeof filePath !== 'string') {
      console.log('Couldnt download...');
      return;
    }
    const newSongObject: CTrack = {
      ...song,
      url: filePath
    }
    useSongs.getState().replace(newSongObject);
  },
  async update(songId: string, accessToken: string): Promise<resolvedPromise> {
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
      return new Promise((resolve, reject) => {
        const task = RNFB.config({
          path: tempPath,
          overwrite: true,
          fileCache: true,
        }).fetch('PATCH', updateUrl, {
          Authorization: `Bearer ${accessToken}`
        });
        task.progress({ interval: 100 }, (recieved) => {
          console.log(`Updated ${recieved / 1024} KB.`);
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
            downloadFile.progress({ interval: 100 }, res => {
              downloadList.add(songId);
              console.log('downloaded: ', res / 1024, 'KB')
              if (res >= minBuffer && !resolved) {
                resolved = true;
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
  },
  addToDownloadMap(id: string, url: string) {
    downloadMap.set(id, url);
    console.log('added', id, url, 'to download map')
  },
  async downloadMap() {
    const songs = useSongs.getState().songs;
    for (const [id, url] of downloadMap) {
      console.log('Loop running!')
      const filePath = await this.downloadSong(url, id)
      if (!filePath || typeof filePath !== 'string') {
        setMessage("Couldn't Read Song! Skipping...");
        console.error("Coudlnt Read song!");
        continue;
      };
      const currentTrack = songs.find(t => t.id === id);
      useSongs.getState().replace({
        mediaId: id,
        url: filePath || url || '',
        title: currentTrack?.title || 'Unkown Song',
        artist: currentTrack?.artist || 'Ilyafy',
        artwork: currentTrack?.thumbnail || thumbnail
      })
    }
    downloadMap.clear();
  },
  async downloadSong(url: string, id: string, state: 'progressive' | 'full' = 'full'): Promise<string | PromiseRejectedResult> {
    const filePath = `${RNFS.CachesDirectoryPath}/${id}.aac`;
    return new Promise((resolve, reject) => {
      if (downloadList.has(id)) {
        console.log('Already downloading !');
        setMessage('Already Reading...');
        reject('Already downloading !');
        return;
      }
      downloadList.add(id);
      const task = RNFB.config({
        path: filePath,
        fileCache: true,
      }).fetch('GET', url);
      let resolved = false;
      let startTime = Date.now();
      let bytesDownloaded: number = 0;
      task.progress({ interval: 250 }, (received, total) => {
        const timeDiff = Date.now() - startTime;
        if (timeDiff >= 1000) {
          const bytesDiff = received - bytesDownloaded;
          const instantSpeedKbps = ((bytesDiff * 8) / (timeDiff / 1000)) / 1000;
          if (smoothedSpeed === 0) {
            smoothedSpeed = instantSpeedKbps;
          } else {
            smoothedSpeed = (instantSpeedKbps * ALPHA) + (smoothedSpeed * (1 - ALPHA));
          }
          useDeviceSetting.getState().setNetworkSpeed(Math.round(smoothedSpeed));
          startTime = Date.now();
          bytesDownloaded = received;
        }
        console.log('Downloading', (received / total) * 100, "% of", id);
        if (state === 'progressive' && received >= minBuffer && !resolved) {
          resolved = true;
          resolve(filePath)
        }
      });
      task.then(() => {
        !resolved && resolve(filePath);
        resolved = true;
      }).catch(err => {
        reject(err);
        console.error('download Error', err);
      }).finally(() => {
        downloadList.delete(id);
      })
    })
  }
}
