import connect from "../../api/auth/connect"
import useProfile from "../../store/useProfile";
export default async ({ email, accessToken }: { email: string, accessToken?: string }) => {
  const setProfile = useProfile.getState().setProfile;
  const profile = useProfile.getState().profile;
  const response: {
    success: boolean;
    message?: string;
    id?: string;
  } | undefined = await connect({ email, accessToken });
  if (response?.success) {
    setProfile({
      name: profile?.name || '',
      email: profile?.email || '',
      room_part_of: response.id || null,
      id: profile?.id || ''
    })
  }
  return response;
}
