import { domain } from "../../path/path";
import useProfile from "../../store/useProfile";
import { TokenProps } from "../../types/components";
import signup from "./signup";
type signUpProps = {
  email: string;
  name: string;
  password: string;
}

type verificationProps = {
  email: string;
  code: number;
  name?: string;
  password?: string;
}

export default {
  get: async (props: signUpProps) => {
    return await signup(props);
  },
  verify: async (props: verificationProps) => {
    const setProfile = useProfile.getState().setProfile;
    const profile = useProfile.getState().profile;
    const setEmail = useProfile.getState().setEmail;
    const setName = useProfile.getState().setName;
    const setAccessToken = useProfile.getState().setAccessToken;
    const setRefreshToken = useProfile.getState().setRefreshToken;
    console.log('Running : verify')
    const res = await fetch(`${domain}/auth/users/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...props })
    });
    if (res.ok) {
      setEmail(props.email);
      setName(props?.name || '');
    }
    const response: TokenProps = await res.json();
    if (response?.success) {
      setProfile({
        email: props.email || '',
        name: props?.name || '',
        id: response?.userId || '',
        room_part_of: profile?.room_part_of || ''
      })
      setAccessToken(response?.accessToken || '');
      setRefreshToken(response?.refreshToken || '');
    }
    console.log('Response from otp: ', response)
  }
}