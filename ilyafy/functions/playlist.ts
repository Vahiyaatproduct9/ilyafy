import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlaylistProp, songProp } from "../types/songs";

export default {
  addSong: async (arg: songProp) => {
    let songList: PlaylistProp = await AsyncStorage.getItem('playlist').then(res => res ? JSON.parse(res) : []);
    songList.push(arg)
    await AsyncStorage.setItem('playlist', JSON.stringify(songList))
      .then(() => true)
      .catch(() => false)
  },
  getSongs: async () => {
    return await AsyncStorage.getItem('playlist').then(res => res ? JSON.parse(res) : [])
  },
  async length() {
    const PL: PlaylistProp = await this.getSongs()
    return PL.length;
  },
  async deleteSong(index: string) {
    let songList: PlaylistProp = await AsyncStorage.getItem('playlist')
      .then(res => res ? JSON.parse(res) : [])
      .catch(err => console.log('Error: ', err))
    songList = songList.filter(t => t.id !== index).map((song, i) => {
      return { ...song, index: i + 1 }
    });
    await AsyncStorage.setItem('playlist', JSON.stringify(songList))
  }

}
