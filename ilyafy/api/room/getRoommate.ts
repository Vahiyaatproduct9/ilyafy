import { domain } from "../../path/path";
import useProfile from "../../store/useProfile";
export default async (): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    room_part_of: string;
  };
  message?: string
} | undefined> => {
  const accessToken = useProfile.getState().accessToken
  const res = await fetch(`${domain}/auth/users/roommate`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  const response = await res.json();
  console.log("response :", response)
  return response;
}