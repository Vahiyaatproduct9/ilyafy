import { domain } from "../../path/path"
import useProfile from "../../store/useProfile"
export default async ({ email, accessToken }: { email: string, accessToken?: string }): Promise<{ success: boolean; message?: string; id?: string } | undefined> => {
  const localAccessToken = useProfile?.getState()?.accessToken;
  const res = await fetch(`${domain}/auth/users/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || localAccessToken}`
    },
    body: JSON.stringify({ email })
  });
  const response = await res.json();
  console.log('respnose from connect.ts : ', response);
  return response;
}
