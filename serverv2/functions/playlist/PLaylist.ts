import getAccessTokenfromHeaders from "@functions/others/getAccessTokenfromHeaders";
import { verifyToken } from "@functions/secret/JWT";
import prisma from "@libs/prisma";
import { deleteType, listType, postType } from "types";

export default class PLaylist {
  async list({
    headers
  }: listType) {
    const token = getAccessTokenfromHeaders(headers)
    const { success, id, message } = await this.#getPLaylist(token)
    if (!success) {
      return {
        success,
        id,
        message
      }
    }
    const songs = await prisma.songs.findMany({
      where: { playlist_part_of: id },
    })
    console.log('songs:', songs);
    return songs;
  }
  async get(songId: string) {
    const song = await prisma.songs.findUnique({
      where: {
        id: songId
      }
    });
    return song;
  }
  async post({ headers, songInfo }: postType) {
    const token = getAccessTokenfromHeaders(headers);
    const { success, id, message, userId } = await this.#getPLaylist(token);
    if (!success) {
      return {
        success,
        message
      }
    }
    const insertSong = await prisma.songs.create({
      data: {
        playlist_part_of: id,
        title: songInfo.title,
        artist: songInfo.artist,
        thumbnail: songInfo.thumbnail,
        added_by: userId,
        url: songInfo.url,
        ytUrl: songInfo.ytUrl,
        playable: songInfo.playable
      }
    });
    if (!insertSong) {
      return {
        success: false,
        message: 'Some Error Occured X('
      }
    }
    return {
      success: true,
      message: 'Added song to playlist!',
      song: insertSong
    }
  }
  async delete({ headers, songId }: deleteType) {
    const token = getAccessTokenfromHeaders(headers);
    const { success, id, message } = await this.#getPLaylist(token);
    if (!success) {
      return {
        success,
        message
      }
    }
    const deleteSong = await prisma.songs.deleteMany({
      where: {
        AND: {
          id: songId,
          playlist_part_of: id
        }
      }
    });
    if (deleteSong.count === 0) {
      return {
        success: false,
        message: "Couldn't Delete Song :("
      }
    }
    return {
      success: true,
      message: 'Deleted Song!',
      count: deleteSong.count
    }
  }
  async #getPLaylist(token: string) {
    const { success, data, message } = verifyToken(token);
    if (!success) {
      return {
        success,
        message,
        id: null
      }
    }
    const playlistId = await prisma.users.findUnique({
      where: {
        id: data?.id
      },
      select: {
        rooms: {
          select: {
            playlists: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });
    if (!playlistId) {
      return {
        success: false,
        message: 'No Playlist linking to the room found!',
        id: null
      }
    }
    return {
      success: true,
      id: playlistId?.rooms?.playlists[0]?.id || '',
      message: 'found.',
      userId: data?.id
    }
  }
}