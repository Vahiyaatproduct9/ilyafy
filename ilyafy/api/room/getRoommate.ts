import { domain } from "../../path/path";
export default async (rooomId: string) => {
  const res = await fetch(`${domain}/auth/users/roommate?roomId=${rooomId}`);
  const response = await res.json();
  console.log("response :", response)
  return response;
}