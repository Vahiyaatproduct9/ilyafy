import { domain } from "../../path/path";
import useProfile from "../../store/useProfile"

export default async (arg: { anonymous: boolean; body: string }): Promise<{ success: boolean; message: string } | undefined> => {
  const accessToken = useProfile.getState().accessToken;
  const res = await fetch(`${domain}/feedback`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(arg)
  });
  const response = await res.json();
  return response;
}