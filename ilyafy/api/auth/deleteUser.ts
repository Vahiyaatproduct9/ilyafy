import { domain } from "../../path/path"
import useProfile from "../../store/useProfile"
export default async (): Promise<{ success: boolean; message: string } | undefined> => {
  const accessToken = useProfile.getState().accessToken;
  const res = await fetch(`${domain}/auth/users`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });
  const response = res.json();
  return response;
}