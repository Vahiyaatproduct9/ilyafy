import { domain } from "../../path/path"
import useProfile from "../../store/useProfile"
import { profile } from "../../types/components";
export default async (): Promise<{ success: boolean; user: profile }> => {
  const accessToken = useProfile.getState().accessToken;
  const res = await fetch(`${domain}/auth/users/refresh-profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  const response = await res.json();
  console.log('response:', response);
  return response;
}