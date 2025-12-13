import { domain } from "../../path/path";
import useProfile from "../../store/useProfile";
export default async (accessToken?: string): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    room_part_of: string;
  };
  message?: string
} | undefined> => {
  const lAccessToken = accessToken || useProfile.getState().accessToken
  const res = await fetch(`${domain}/auth/users/roommate`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${lAccessToken}`
    }
  });
  const response = await res.json();
  console.log("response :", response)
  return response;
}