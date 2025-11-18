import { domain } from "../../path/path";
type signUpProps = {
  email: string;
  name?: string;
  password: string;
}
export default async ({ email, name, password }: signUpProps) => {
  const res = await fetch(`${domain}/auth/users`, {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  });
  const response = await res.json();
  console.log('response: ', response)
}