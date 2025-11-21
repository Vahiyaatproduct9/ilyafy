import useProfile from "../../store/useProfile";
import JWTExpiry from '../miscellanous/JWTExpiry'
import refreshJWTs from "../../api/auth/refreshJWTs";
export default async () => {
  const setAccessToken = useProfile.getState().setAccessToken;
  const setRefreshToken = useProfile.getState().setRefreshToken;
  const oldAccessToken = useProfile.getState().accessToken || '';
  const timeLeft = JWTExpiry(oldAccessToken);
  console.log('TIme Left for EXpiry: ', timeLeft)
  if (timeLeft < 5) {
    console.log('UPdating AccessToken')
    const response = await refreshJWTs();
    if (response?.success) {
      setAccessToken(response?.accessToken || '');
      setRefreshToken(response?.refreshToken || '');
    }
  }
}