import getAccessTokenfromHeaders from "@functions/others/getAccessTokenfromHeaders";
import { verifyToken } from "@functions/secret/JWT";
import getMetaData from "@functions/stream/getMetaData";
import prisma from "@libs/prisma";
import { IncomingHttpHeaders } from "http";
import { deleteType, listType, postType, song } from "types";

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
  async post({ url, headers }: { url: string; headers: IncomingHttpHeaders & { authorization: string; } }) {
    const metadata: any = await getMetaData({ url });
    const audioFormat = metadata?.formats?.find(
      f => f.acodec !== 'none' && f.vcodec === 'none' && f.protocol === 'https'
    );
    if (!audioFormat) {
      return {
        success: false,
        message: 'Cannot find Streamable Service, Please choose another song!'
      }
    }
    const { ok } = await fetch(audioFormat?.url, { method: 'HEAD' })
    const payload: song = {
      title: metadata?.title || null,
      artist: metadata?.artist || metadata?.uploader || null,
      thumbnail: metadata?.thumbnail || null,
      playable: ok ? true : false,
      ytUrl: url,
      url: metadata?.url || audioFormat?.url || '',
      duration: metadata?.duration || null,
      success: true,
      ...audioFormat,
    };
    return await this.#addToDB({ songInfo: payload, headers })

  }
  async #addToDB({ headers, songInfo }: { headers: IncomingHttpHeaders & { authorization: string; }; songInfo: song }) {
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