import { domain } from "../../path/path";
import { signInProps } from "../../types/components";
import useProfile from "../../store/useProfile";
import messaging from "@react-native-firebase/messaging";
export default async ({ email, password }: { email: string; password: string }) => {
  const fcmToken = await messaging().getToken();
  const setAccessToken = useProfile?.getState()?.setAccessToken;
  const setRefreshToken = useProfile?.getState()?.setRefreshToken;
  const setProfile = useProfile?.getState()?.setProfile;
  const res = await fetch(`${domain}/auth/users/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email?.trim().toLowerCase(),
      password,
      fcmToken
    })
  })
  const response: signInProps | undefined = await res.json();
  if (response?.token.success) {
    setAccessToken(response?.token?.accessToken || '');
    setRefreshToken(response?.token?.refreshToken || '');
    setProfile(response?.profile)
  }
  console.log('message: ', response);
  return response;
}