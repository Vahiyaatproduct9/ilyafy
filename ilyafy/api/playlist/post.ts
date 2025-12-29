import NewPipeModule from "../../modules/NewPipeModule";
import { domain } from "../../path/path";
import useProfile from "../../store/useProfile";
import { songProp } from "../../types/songs";
type postType = {
  success: boolean;
  song?: songProp;
  message: string;
} | undefined;
export default async (url: string): Promise<postType> => {
  const roomMember = useProfile?.getState().profile?.room_part_of;
  if (roomMember) {
    const newSong = await NewPipeModule.extractStream(url);
    if (!newSong) {
      return { success: false, message: "Couldn't Extract Info :(" }
    }
    const resSet = new Set<number>();
    newSong?.thumbnails?.forEach(t => {
      resSet.add(t.height * t.width)
    })
    const maxResThumbnail = newSong?.thumbnails?.find(t => (t.height * t.width) === Math.max(...resSet))
    const body = {
      url: newSong?.audioStream?.url,
      title: newSong?.title,
      thumbnail: maxResThumbnail?.url,
      artist: newSong?.uploader,
      ytUrl: url,
    }
    const accessToken = useProfile?.getState()?.accessToken;
    const res = await fetch(`${domain}/playlist`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const response = await res.json();
    return response;
  }
  return;
}
