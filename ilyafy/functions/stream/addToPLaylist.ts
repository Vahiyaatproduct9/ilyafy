import { domain } from "../../path/path";
import { InfoResponseProp } from "../../types/songs";
import playlist from "../playlist";

export default async (url: string) => {
  const res = await fetch(`${domain}/stream/addToPlaylist?url=${url}`)
  const response: InfoResponseProp = await res.json();
  console.log('response from addtoplaylist: ', response);
  const metadata = {
    id: Date.now().toString(),
    title: response?.title || 'Unknown Song',
    url: response?.url || '',
    thumbnail: response?.thumbnail || '',
    artist: response?.artist || '',
    playable: response.playable || false,
    ytLink: url
  }
  await playlist.addSong(metadata)
  return { ...response, ...metadata };
}