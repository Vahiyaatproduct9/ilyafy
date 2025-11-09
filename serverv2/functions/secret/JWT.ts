import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import prisma from '@libs/prisma';
import * as auth from '../../types/auth';
const publicKey = readFileSync('./public.pem', 'utf8')
const privateKey = readFileSync('./private.pem', 'utf8');
export function createToken(user: auth.tokenType) {
  try {
    const accessToken = jwt.sign({
      id: user.id,
      name: user.name
    }, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h'
    })
    const refreshToken = jwt.sign(user, privateKey, {
      expiresIn: '7d'
    })
    return { refreshToken, accessToken, success: true }
  } catch (error) {
    return { success: false, message: 'Error:' + error }
  }
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
    const verified = jwt.verify(refreshToken, publicKey);
    if (typeof verified === 'string' || !verified || typeof verified !== 'object') {
      return {
        success: false,
        message: 'Invalid Refresh Token.'
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
  if (userToken && payload?.tokenVersion === userToken.tokenVersion) {
    await prisma.users.update({
      where: {
        id: payload.id
      }, data: {
        tokenVersion: { increment: 1 }
      }
    })
    return createToken({ id: payload.id, name: payload.name, tokenVersion: payload.tokenVersion })
  }
  return { success: false, message: 'User not found.' };
}