import { domain } from "../../path/path";
import { signUp } from "../../types/components";
type signUpProps = {
  email: string;
  name: string;
  password: string;
}
export default async ({ email, name, password }: signUpProps) => {
  const res = await fetch(`${domain}/auth/users/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, name })
  });
  const response: signUp = await res.json();
  console.log('response: ', response)
  return response;
}