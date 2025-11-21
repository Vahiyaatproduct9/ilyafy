import { domain } from "../../path/path"
import useProfile from "../../store/useProfile"
export default async (email: string) => {
  const accessToken = useProfile.getState().accessToken;
  const res = await fetch(`${domain}/auth/users/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, accessToken })
  });
  const response = await res.json();
  console.log('respnose from connect.ts : ', response);
  return response;
}