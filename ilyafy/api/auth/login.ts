import { domain } from "../../path/path";
export default async ({ email, password }: { email?: string; password: string }) => {
  const res = await fetch(`${domain}/auth/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  })
  const response = await res.json();
  console.log('message: ', response);
}