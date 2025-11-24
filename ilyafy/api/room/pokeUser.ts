import { domain } from "../../path/path";
import useProfile from "../../store/useProfile";
export default () => {
  const accessToken = useProfile.getState().accessToken;
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