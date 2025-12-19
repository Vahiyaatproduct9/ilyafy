import { domain } from "../../path/path";
import useProfile from "../../store/useProfile";
export default async (refreshToken?: string) => {
  const localRefreshToken = useProfile?.getState()?.refreshToken;

  const res = await fetch(`${domain}/auth/users/refresh-token?refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken: refreshToken || localRefreshToken })
  });
  const response: {
    refreshToken?: string;
    accessToken?: string;
    success: boolean;
    message?: undefined;
    error?: string;
  } | undefined = await res.json();
  console.log('Fetching : ', response);

  return response;
}