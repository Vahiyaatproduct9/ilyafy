import { domain } from "../../path/path";
import useProfile from "../../store/useProfile";
export default async (url: string) => {
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
