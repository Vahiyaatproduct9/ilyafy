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
      // const roomExists = await prisma.users.findMany({
      //   where: {
      //     OR: [
      //       { email },
      //       { id: data?.id }
      //     ]
      //   }
      // });
      // if (roomExists?.length === 2 && roomExists[0].room_part_of === roomExists[1].room_part_of) {
      //   return {
      //     ...roomExists.find(t => t.email = email),
      //     success: true,
      //     message: 'Room already exists!'
      //   }
      // }
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
  }
  async addToPlaylist(info: roomPlaylist) {
    const { success, data, message } = verifyToken(info.accessToken);
    if (!success) {
      return {
        success,
        message
      }
    }
    const addedSong = await prisma.rooms.update({
      where: {
        id: info.roomId
      },
      data: {
        playlists: {
          update: {
            where: {
              room_part_of: info.roomId
            },
            data: {
              songs: {
                create: {
                  title: info.song.title,
                  artist: info.song.artist,
                  thumbnail: info.song.thumbnail,
                  url: info.song.url,
                  playable: info.song.playable || false,
                  added_by: data?.id,
                  ytUrl: info.song.ytUrl
                }
              }
            }
          }
        }
      }
    });
    return addedSong;
  }
};