import { SignInData, SignUpData } from 'types/auth';
import prisma from '@libs/prisma';
import { encrypt, decrypt } from '@functions/secret/cryption';
import mailto from '@libs/mailer';
import verification from '@templates/verification';
import { createToken } from '@functions/secret/JWT';
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
    if (existingUser) {
      return { success: false, message: 'Email already in use' };
    }
    const user = await prisma.users.create({
      data: {
        name: info.name,
        email: info.email,
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
    if (decrypt(user.password || '') === arg.password) {
      const token = createToken({
        name: user.name,
        id: user.id,
        exp: 60 * 60 * 24 * 7
      })
      return {
        success: true,
        message: 'Sign in successful',
        userId: user.id,
        token
      }
    }
    return {
      success: false,
      message: 'Incorrect password'
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
  async verifyEmail({ email, code }: { email: string, code: string }) {
    const storedCode = codes.get(email);
    console.log('code:', codes.entries())
    if (storedCode === code) {
      const user = await prisma.users.updateManyAndReturn({
        where: {
          email
        },
        data: {
          authenticated: true
        }
      });
      codes.delete(email);
      const token = createToken({
        name: user[0].name,
        id: user[0].id,
        exp: 60 * 60 * 24 * 7
      })
      if (token.success) {
        return {
          success: true,
          message: 'Email verified successfully',
          token: token.token
        }
      }
    }
    return {
      success: false,
      message: 'Invalid verification code'
    }
  }

}
