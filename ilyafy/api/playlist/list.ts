import useProfile from "../../store/useProfile";
import { domain } from "../../path/path";
export default async () => {
  const accessToken = useProfile.getState().accessToken;
  const res = await fetch(`${domain}/playlist/list`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  const response = await res.json();
  console.log('Response :', response);
  return response;
}
