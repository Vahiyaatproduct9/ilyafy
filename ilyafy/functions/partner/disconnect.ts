import TrackPlayer from "react-native-track-player";
import disconnect from "../../api/auth/disconnect";
import useMessage from "../../store/useMessage";
import useProfile from "../../store/useProfile";
import useSongs from "../../store/useSongs";
export default async () => {
  const setMessage = useMessage.getState().setMessage;
  const response = await disconnect();
  setMessage(response?.message || '')
  if (!response?.success) {
    return response;
  }
  const profile = useProfile.getState().profile;
  const setProfile = useProfile.getState().setProfile;
  setProfile(profile ? {
    ...profile, room_part_of: null
  } : null);
  useSongs?.getState().setSong([]);
  await TrackPlayer.reset();
  return response;
}