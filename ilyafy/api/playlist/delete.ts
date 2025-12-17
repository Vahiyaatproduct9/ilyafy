import { domain } from "../../path/path";
import useProfile from "../../store/useProfile";
export default async (songId: string): Promise<{ success: boolean; message: string; count?: number } | undefined> => {
  const accessToken = useProfile?.getState()?.accessToken;
  const res = await fetch(`${domain}/playlist`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ songId })
  });
  const response = await res.json();
  console.log('delete song: ', response);
  return response;
}
