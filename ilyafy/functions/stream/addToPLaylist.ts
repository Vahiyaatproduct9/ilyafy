import { domain } from "../../path/path";
import { InfoResponseProp } from "../../types/songs";
import playlist from "../playlist";

export default async (url: string) => {
  const res = await fetch(`${domain}/stream/addToPlaylist?url=${url}`, {
    method: 'GET'
  })
  const response: InfoResponseProp = await res.json();
  console.log('response from addtoplaylist: ', response);
  const metadata = {
    index: await playlist.length() + 1 || Date.now(),
    title: response?.title || 'Unknown Song',
    url: response?.url || '',
    thumbnail: response?.thumbnail || '',
    artist: response?.artist || '',
    playable: response.playable || false,
    ytLink: url
  }
  await playlist.addSong(metadata)
  return { ...response, ytLink: url };
}