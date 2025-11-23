import { domain } from "../../path/path";
export default async (songId: string) => {
  const res = await fetch(`${domain}/playlist?songId=${songId}`);
  const response = await res.json();
  console.log('Response :', response);
  return response;
}