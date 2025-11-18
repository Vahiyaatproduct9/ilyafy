import { domain } from "../../path/path";
import signup from "./signup";
type signUpProps = {
  email: string;
  name?: string;
  password: string;
}

type verificationProps = {
  email: string;
  code: number;
}

export default {
  get: async (props: signUpProps) => {
    return await signup(props);
  },
  verify: async (props: verificationProps) => {
    console.log('Running : verify')
    const res = await fetch(`${domain}/auth/users/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...props })
    });
    const response = await res.json();
    console.log('Response from otp: ', response)
  }
}