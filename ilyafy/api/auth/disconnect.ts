import { domain } from "../../path/path"
import useProfile from "../../store/useProfile"
export default async (accessToken: string): Promise<{ success: boolean; message: string } | undefined> => {
  const localAccessToken = useProfile?.getState()?.accessToken;
  const res = await fetch(`${domain}/auth/users/connect`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || localAccessToken}`
    },
  });
  const response = await res.json();
  const setProfile = useProfile.getState().setProfile;
  const profile = useProfile.getState().profile;
  if (response?.success) setProfile(profile ? { ...profile, room_part_of: null } : null)
  console.log('respnose from disconnect.ts:', response);
  return response;
}