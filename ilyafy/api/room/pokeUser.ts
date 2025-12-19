import { domain } from "../../path/path";
import useProfile from "../../store/useProfile";
export default (): Promise<{ success: boolean; message: string; error?: string; } | undefined> => {
  const accessToken = useProfile?.getState()?.accessToken;
  const poke = async () => {
    const res = await fetch(`${domain}/auth/users/poke`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return await res.json();
  };
  return poke();
}