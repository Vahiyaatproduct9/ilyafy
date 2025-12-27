import connect from "../../api/auth/connect";
import useMessage from "../../store/useMessage";
import useProfile from "../../store/useProfile";
export default async (email: string):
  Promise<{ success: boolean; message?: string; id?: string; } | undefined> => {
  const setMessage = useMessage.getState().setMessage;
  const response = await connect({ email });
  setMessage(response?.message || '')
  if (!response?.success) {
    return;
  }
  const profile = useProfile.getState().profile;
  const setProfile = useProfile.getState().setProfile;
  setProfile(profile ? { ...profile, room_part_of: response?.id || null } : null);
  return response;
}