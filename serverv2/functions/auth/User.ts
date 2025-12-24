import { SignInData, SignUpData, tokenType } from 'types';
import prisma from '@libs/prisma';
import { encrypt, decrypt } from '@functions/secret/cryption';
import mailto from '@libs/mailer';
import verification from '@templates/verification';
import * as JWT from '@functions/secret/JWT';
import notification from '@libs/notification';
const codes = new Map<string, string>();
export default class User {
  async signup(info: SignUpData) {
    info.email = info.email.toLowerCase();
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
        password: encrypt(info.password),
        fcm_token: info.fcmToken
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
    arg.email = arg.email.toLowerCase();
    const user = await prisma.users.update({
      where: {
        email: arg.email
      },
      data: {
        fcm_token: arg.fcmToken
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
    const token = this.createToken({
      name: user.name,
      id: user.id,
      tokenVersion: user.tokenVersion
    })
    return {
      token,
      success: true,
      profile: {
        name: user.name,
        id: user.id,
        room_part_of: user.room_part_of,
        email: user.email
      },
      message: 'Sign in successful',
    }
  }
  async #sendVerificationEmail(email: string) {
    email = email.toLowerCase();
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
    email = email.toLowerCase();
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
          message: 'Email verified successfully.',
          ...token,
          userId: user[0].id || ''
        }
      }
    }
    return {
      success: false,
      message: 'Invalid verification code'
    }
  }
  async getRoommate(token: string) {
    const { success, data, message } = this.verifyToken(token);
    if (!success) {
      return {
        success,
        message
      }
    }
    const roommate = await prisma.users.findUnique({
      where: {
        id: data?.id || ''
      },
      select: {
        rooms: {
          select: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                room_part_of: true,
              }
            }
          }
        }
      }
    });
    if (!roommate) {
      return {
        success: false,
        message: 'Something went wrong! X('
      }
    }

    const partner = roommate.rooms?.users.find(t => t.id !== data?.id)
    return {
      success: true,
      user: partner
    }
  }
  async pokeUser(token: string) {
    const { success, data, message } = this.verifyToken(token);
    if (!success) {
      return {
        success,
        message,
      }
    }
    const users = await prisma.users.findUnique({
      where: {
        id: data?.id
      },
      select: {
        rooms: {
          select: {
            users: {
              select: {
                fcm_token: true,
                name: true,
                id: true
              }
            }
          }
        }
      }
    });
    const partner = users?.rooms?.users.find(t => t.id !== data?.id);
    // CHANGE THE '===' TO '!=='
    const sent = await notification({
      message: {
        title: 'Ouch!',
        body: `${partner?.name || 'They'} poked you to join!`,
        event: 'poke'
      },
      fcmToken: partner?.fcm_token || '',
    });
    if (!sent) {
      return {
        success: false,
        message: 'Couldn\'t poke them... :('
      }
    }
    return {
      success: true,
      message: 'Made them mad! >:)'
    }
  }
  createToken(users: tokenType) {
    return JWT.createToken(users)
  }
  verifyToken(token: string) {
    return JWT.verifyToken(token)
  }
  async refreshToken(refreshToken: string) {
    return await JWT.refreshToken(refreshToken)
  }
}
