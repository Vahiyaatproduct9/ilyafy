import jwt from 'jsonwebtoken';
import { existsSync, readFileSync } from 'fs';
import prisma from '@libs/prisma';
import * as auth from '../../types/auth';
import { configDotenv } from 'dotenv';
configDotenv()
function validFile(fileName: string) {
  const fileHere = `./${fileName}`;
  const fileRoot = `/${fileName}`;
  const fileSecrets = `/etc/secrets/${fileName}`
  const fileExistsRoot = existsSync(fileRoot);
  const fileExistsSecret = existsSync(fileSecrets);
  if (fileExistsRoot) return fileRoot;
  if (fileExistsSecret) return fileSecrets;
  return fileHere;
}
const publicKey = readFileSync(validFile('public.pem'), 'utf8')
const privateKey = readFileSync(validFile('private.pem'), 'utf8');
const SECRET_KEY = process.env.PASSWORD_ENCRYPTION_KEY || '';
export function createToken(user: auth.tokenType) {
  console.log('user: ', user)
  try {
    const accessToken = jwt.sign({
      id: user.id,
      name: user.name,
    }, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h'
    })
    const refreshToken = jwt.sign(user, SECRET_KEY, {
      expiresIn: '7d',
      algorithm: 'HS256'
    })
    return { refreshToken, accessToken, success: true }
  } catch (error) {
    return { success: false, message: error }
  }
}

export function verifyToken(token: string) {
  if (!token) return {
    success: false,
    message: 'No Token Provided'
  }
  let e;
  try {
    const data = jwt.verify(token, publicKey);
    if (typeof data === 'object') return {
      success: true, message: 'Verified', data: data as {
        id: string;
        name: string;
      }
    }
  } catch (error) {
    e = error;
  }
  return { success: false, message: `Invalid Token: ${e}`, data: null }
}

export async function refreshToken(refreshToken: string) {
  if (!refreshToken) return {
    success: false,
    message: 'No Refresh Token Provided.'
  }
  let payload: {
    id: string;
    name: string;
    tokenVersion: number
  };
  try {
    const verified = jwt.verify(refreshToken, SECRET_KEY);
    console.log('Token: ', verified)
    if (typeof verified === 'string' || !verified || typeof verified !== 'object') {
      return {
        success: false,
        message: 'Invalid Refresh Token.',
      }
    }
    payload = verified as { id: string; name: string; tokenVersion: number };
  } catch (e) {
    return {
      success: false,
      message: 'Invalid Refresh Token.',
      error: e
    }
  }
  const userToken = await prisma.users.findUnique({ where: { id: payload.id }, select: { tokenVersion: true } });
  console.log('user : ', userToken);
  if (userToken && payload?.tokenVersion === userToken.tokenVersion) {
    const newPayload = await prisma.users.update({
      where: {
        id: payload.id
      }, data: {
        tokenVersion: { increment: 1 }
      }
    })
    return createToken({ id: newPayload.id, name: newPayload.name, tokenVersion: newPayload.tokenVersion })
  }
  return { success: false, message: 'User not found.' };
}