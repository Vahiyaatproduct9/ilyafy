import { SignInData, SignUpData, tokenType } from 'types/auth';
import prisma from '@libs/prisma';
import { encrypt, decrypt } from '@functions/secret/cryption';
import mailto from '@libs/mailer';
import verification from '@templates/verification';
import * as JWT from '@functions/secret/JWT';
const codes = new Map<string, string>();
export default class User {
  async signup(info: SignUpData) {
    if (!info.name || !info.email || !info.password) {
      return { success: false, message: 'Missing required fields' };
    }
    const existingUser = await prisma.users.findUnique({
      where: {
        email: info.email
      }
    });
    if (existingUser && existingUser.authenticated) {
      return { success: false, message: 'Email already in use' };
    }
    const user = await prisma.users.upsert({
      where: { email: info.email },
      create: {
        name: info.name,
        email: info.email,
        password: encrypt(info.password)
      },
      update: {
        name: info.name,
        password: encrypt(info.password)
      }
    })
    if (user) {
      let mail: any;
      try {
        mail = await this.#sendVerificationEmail(info.email);
        if (!mail.success) {
          await prisma.users.delete({
            where: {
              id: user.id
            }
          });
          return { success: false, message: 'User created but failed to send verification email' };
        }
      } catch (e) {
        console.log('Error sending verification email:', e);
        await prisma.users.delete({
          where: {
            id: user.id
          }
        });
        return { success: false, message: 'User created but failed to send verification email' };
      }
      codes.set(info.email, mail.code)
      console.log('codes: ', codes.entries())
      setTimeout(() => { codes.delete(info.email); }, 10 * 60 * 1000);
      return { success: true, message: 'User created successfully', userId: user.id };
    }
    return { success: false, message: 'User creation failed' };
  }
  async signin(arg: SignInData) {
    const user = await prisma.users.findUnique({
      where: {
        email: arg.email
      }
    });
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      }
    }
    if (decrypt(user.password || '') !== arg.password) {
      return {
        success: false,
        message: 'Incorrect password'
      }
    }
    console.log("level 3:", arg, user)
    const token = this.createToken({
      name: user.name,
      id: user.id,
      tokenVersion: user.tokenVersion
    })
    return {
      token,
      profile: user,
      message: 'Sign in successful',
    }

  }
  async #sendVerificationEmail(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const mail = await mailto({
      to: email,
      subject: 'Verify your email',
      html: verification(code)
    })
    return {
      ...mail,
      code
    }
  }
  async verifyEmail({ email, code }: { email: string, code: number }) {
    console.log('Verify email running');
    const storedCode = codes.get(email);
    console.log('code:', codes.entries())
    if (code === parseInt(storedCode ?? '')) {
      const user = await prisma.users.updateManyAndReturn({
        where: {
          email
        },
        data: {
          authenticated: true
        }
      });
      codes.delete(email);
      const token = this.createToken({
        name: user[0].name,
        id: user[0].id,
        tokenVersion: user[0].tokenVersion
      })
      if (token.success) {
        return {
          message: 'Email verified successfully',
          ...token
        }
      }
    }
    return {
      success: false,
      message: 'Invalid verification code'
    }
  }
  createToken(users: tokenType) {
    return JWT.createToken(users)
  }
  verifyToken(args: { token: string }) {
    return JWT.verifyToken(args.token)
  }
  async refreshToken(args: { refreshToken: string }) {
    return await JWT.refreshToken(args.refreshToken)
  }
}
