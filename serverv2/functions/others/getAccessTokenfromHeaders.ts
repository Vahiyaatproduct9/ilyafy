import { IncomingHttpHeaders } from "http"
export default (headers: IncomingHttpHeaders & { authorization: string } | undefined) => {
  const token = headers?.authorization?.split(' ')[1] || '';
  return token;
}