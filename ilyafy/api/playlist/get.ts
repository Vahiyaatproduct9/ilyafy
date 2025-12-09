import { domain } from "../../path/path";
import { songProp } from "../../types/songs";
export default async (songId: string) => {
  const res = await fetch(`${domain}/playlist?songId=${songId}`);
  const response: {
    success: boolean;
    song?: songProp;
    message: string;
  } | undefined = await res.json();
  console.log('Response :', response);
  return { ...response, song: { ...response?.song, mediaId: response?.song?.id } };
}