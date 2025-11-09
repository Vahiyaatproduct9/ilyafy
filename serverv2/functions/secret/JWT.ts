import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
const publicKey = readFileSync('./public.pem', 'utf8')
const privateKey = readFileSync('./private.pem', 'utf8');
export function createToken(user: { id: string, name: string, exp: number }) {
  const token = jwt.sign(user, privateKey, {
    algorithm: 'RS256'
  })
  return { token, success: true }
}

export function verifyToken(token: string) {
  if (!token) return {
    success: false,
    message: 'No Token Provided'
  }
  try {
    const data = jwt.verify(token, publicKey);
    if (data) return { success: true }
  } catch (e) {
    return { success: false, message: `Invalid Token: ${e}` }
  }
}