import { verifyToken } from "@functions/secret/JWT";
import prisma from "@libs/prisma";
import type { roomPlaylist } from 'types';
import { randomBytes } from "crypto";
export default class Connection {
  async search(email: string) {
    const result = await prisma.users.findUnique({
      where: {
        email
      },
      select: {
        name: true,
        email: true,
        id: true
      }
    });
    if (!result) {
      return {
        success: false,
        message: 'User not found!'
      }
    }
    return {
      success: true,
      message: 'Found User!',
      user: result
    }
  };
  async connectUser({ email, accessToken }: { email: string; accessToken: string }) {
    const { success, data, message } = verifyToken(accessToken);
    if (!success) {
      return {
        success,
        message
      }
    }
    try {
      const emailExists = await prisma.users.findUnique({
        where: {
          email
        }
      });
      if (!emailExists) {
        return {
          success: false,
          message: 'Email not found :('
        }
      }
      if (emailExists.room_part_of) {
        return {
          success: false,
          message: `${emailExists.name} is already paired with somebody :(`
        }
      }
      const newRoom = await prisma.rooms.create({
        data: {
          code: randomBytes(6).toString('hex'),
          playlists: {
            create: {
              title: 'PLAYLIST'
            }
          }
        },
        select: {
          id: true,
        }
      });
      await prisma.users.updateMany({
        where: {
          OR: [
            { id: data?.id || '' },
            { email }
          ],
        },
        data: {
          room_part_of: newRoom.id,
        }
      })
      return { ...newRoom, success: true };
    } catch (err) {
      console.log('Some Error Occured', err);
      return {
        success: false,
        message: err
      }
    }
  };
  async disconnectUser(token: string) {
    const { data, success, message } = verifyToken(token);
    if (!success) return {
      success,
      message
    }
    const deletedRoom = await prisma.rooms.deleteMany({
      where: {
        users: {
          every: {
            id: data?.id
          }
        }
      }
    });
    if (deletedRoom?.count > 0) return {
      success: true,
      message: 'Unpaired :D'
    }
    return {
      success: false,
      message: 'Couldn\'t Disconnect :('
    }
  }
};