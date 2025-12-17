import useProfile from "../../store/useProfile";
import { domain } from "../../path/path";
import { songProp } from "../../types/songs";
export default async (accessToken?: string): Promise<{ success: boolean; songs?: songProp[]; message: string } | undefined> => {
  const localAccessToken = useProfile?.getState()?.accessToken;
  const res = await fetch(`${domain}/playlist/list`, {
    headers: {
      Authorization: `Bearer ${accessToken || localAccessToken}`
    }
  });
  const response = await res.json();
  console.log('Response :', response);
  return response;
}
