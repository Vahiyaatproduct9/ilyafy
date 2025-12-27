import { domain } from "../../path/path"
import useProfile from "../../store/useProfile"
export default async (): Promise<{ success: boolean; message: string } | undefined> => {
  const localAccessToken = useProfile?.getState()?.accessToken;
  const res = await fetch(`${domain}/auth/users/connect`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localAccessToken}`
    },
  });
  const response = await res.json();
  console.log('respnose from disconnect.ts:', response);
  return response;
}