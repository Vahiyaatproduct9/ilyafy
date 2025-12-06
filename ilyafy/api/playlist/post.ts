import { domain } from "../../path/path";
import useProfile from "../../store/useProfile";
import { songProp } from "../../types/songs";
type postType = {
  success: boolean;
  song?: songProp;
  message: string;
} | undefined;
export default async (url: string): Promise<postType> => {
  const accessToken = useProfile.getState().accessToken;
  const res = await fetch(`${domain}/playlist`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });
  const response = await res.json();
  console.log('post:', response);
  return response;
}
