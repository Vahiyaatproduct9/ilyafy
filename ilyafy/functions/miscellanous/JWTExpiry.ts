import { jwtDecode } from "jwt-decode";

export default function isAccessTokenExpired(token: string) {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return (exp * 1000 - Date.now()) / 60000;
  } catch (e) {
    console.error('Invalid token format', e);
    return 0;
  }
}
