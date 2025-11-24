import { domain } from "../../path/path";
import { signUp } from "../../types/components";
import message from '@react-native-firebase/messaging'
type signUpProps = {
  email: string;
  name: string;
  password: string;
}
export default async ({ email, name, password }: signUpProps) => {
  const fcmToken = await message().getToken()
  const res = await fetch(`${domain}/auth/users/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password, name, fcmToken })
  });
  const response: signUp = await res.json();
  console.log('response: ', response)
  return response;
}