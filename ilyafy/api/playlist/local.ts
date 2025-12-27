import AsyncStorage from "@react-native-async-storage/async-storage"
import { PlaylistProp, songProp } from "../../types/songs";
import NewPipeModule from "../../modules/NewPipeModule";
export default {
  async playlist() {
    const res = await AsyncStorage.getItem('localPlaylist')
    let response: PlaylistProp | undefined;
    try {
      response = JSON.parse(res || '')
    } catch (err) {
      console.log('Error in local Playlist:', err)
      response = []
    }
    return response;

  },
  async list() {

    const response = await this.playlist();
    console.log('list:', response)
    if (response) {
      return {
        success: true,
        songs: response,
        message: 'Loaded Songs!'
      }
    } else {
      return {
        success: false,
        message: 'Some ERROR Occured!'
      }
    }
  },
  async get(id: string) {
    console.log('provided song id:', id)
    const response = await this.playlist();
    const song = response?.find(t => t.id === id)
    console.log('get:', song)
    const reply = {
      success: song ? true : false,
      song,
      message: song ? 'Found!' : 'Not Found!',
    }
    return reply;
  },
  async post(arg: songProp | string) {
    const current = (await this.playlist()) || [];
    if (typeof arg !== 'string') {
      current.push(arg);
      await AsyncStorage.setItem('localPlaylist', JSON.stringify(current), (err) => {
        console.log('error:', err);
        if (err) {
          return {
            success: false,
            message: err.message
          }
        }
      });
      const response = {
        success: true,
        song: arg,
        message: 'song added successfully!'
      }
      console.log('post:', response);
      return response;
    } else {
      const songDetails = await NewPipeModule.extractStream(arg);
      const newSongObject: songProp = {
        id: Date.now().toString(),
        ytUrl: arg,
        url: songDetails?.audioStream?.url || '',
        title: songDetails?.title || '',
        artist: songDetails?.uploader || '',
        playable: true,
        duration: songDetails?.duration,
        thumbnail: songDetails?.thumbnails[songDetails?.thumbnails.length - 1].url || '',
      }
      current.push(newSongObject)
      await AsyncStorage.setItem('localPlaylist', JSON.stringify(current), err => {
        console.log('error:', err);
        if (err) {
          return {
            success: false,
            message: err.message,
          }
        }
      });
      const response = {
        success: true,
        message: 'Song Added!',
        song: newSongObject
      }
      console.log('post:', response);
      return response;
    }
  },
  async delete(id: string) {
    const playlist = await this.playlist();
    console.log('id:', id)
    console.log('playlist:', playlist);
    console.log('filtered playlist:', playlist?.find(t => t.id === id))
    const newPLaylist = playlist?.filter(t => t.id !== id);
    await AsyncStorage.setItem('localPlaylist', JSON.stringify(newPLaylist), err => {
      console.log('error:', err);
      if (err) {
        return {
          success: false,
          message: err.message,
        }
      }
    });
    const response = {
      success: true,
      message: 'Song Deleted!',
      count: (newPLaylist?.length || 0) - (playlist?.length || 0)
    };
    console.log('delete:', response);
    return response;
  }
}