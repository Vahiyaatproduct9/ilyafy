import getAccessTokenfromHeaders from "@functions/others/getAccessTokenfromHeaders";
import { verifyToken } from "@functions/secret/JWT";
// import getMetaData from "@functions/stream/getMetaData";
import notification from "@libs/notification";
import prisma from "@libs/prisma";
import { IncomingHttpHeaders } from "http";
import { deleteType, listType, postType, song } from "types";

export default class PLaylist {
  async list({
    headers
  }: listType) {
    const token = getAccessTokenfromHeaders(headers);
    const { success, id, message } = await this.#getPlaylist(token);
    if (!success || !id) {
      return {
        success,
        id,
        message
      }
    }
    try {
      const songs = await prisma.songs.findMany({
        where: { playlist_part_of: id },
      });
      return {
        success: true,
        songs,
        message: 'Loaded Songs!'
      }
    } catch (e) {
      return {
        success: false,
        message: e
      }
    }
  }
  async get(songId: string) {
    const song = await prisma.songs.findUnique({
      where: {
        id: songId
      }
    });
    if (!song) {
      return {
        success: false,
        message: 'Some Error Occured!'
      }
    }
    return {
      success: true,
      song,
      message: 'Got missing song!'
    }
  }
  async post({ body, headers }: postType) {
    // const metadata: any = await getMetaData({ url });
    // const audioFormat = metadata?.formats?.find(
    //   f => f.acodec !== 'none' && f.vcodec === 'none' && f.protocol === 'https'
    // );
    // if (!audioFormat) {
    //   return {
    //     success: false,
    //     message: 'Cannot find Streamable Service, Please choose another song!'
    //   }
    // }

    // const { ok } = await fetch(audioFormat?.url, { method: 'HEAD' })
    // const payload: song = {
    //   title: metadata?.title || null,
    //   artist: metadata?.artist || metadata?.uploader || null,
    //   thumbnail: metadata?.thumbnail || null,
    //   playable: ok ? true : false,
    //   ytUrl: url,
    //   url: metadata?.url || audioFormat?.url || '',
    //   duration: metadata?.duration || null,
    //   success: true,
    //   ...audioFormat,
    // };
    const payload: song = {
      ...body,
      playable: false
    }
    console.log('POSTED SONG:', payload)
    const result = await this.#addToDB({ songInfo: payload, headers })
    return result;
  }
  async #addToDB({ headers, songInfo }: { headers: IncomingHttpHeaders & { authorization: string; }; songInfo: song }) {
    const token = getAccessTokenfromHeaders(headers);
    const { success, id, message, userId } = await this.#getPlaylist(token);
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
        playable: songInfo.playable,
      },
      select: {
        id: true,
        title: true,
        artist: true,
        thumbnail: true,
        added_by: true,
        added_at: true,
        url: true,
        ytUrl: true,
        playable: true,
        playlists: {
          select: {
            rooms: {
              select: {
                users: true
              }
            }
          }
        }
      }
    });
    if (!insertSong) {
      return {
        success: false,
        message: 'Some Error Occured X('
      }
    }
    const { success: userSuccess } = verifyToken(token);
    if (userSuccess) {
      for (const user of (insertSong?.playlists?.rooms?.users || [])) {
        notification({
          message: {
            title: '+1',
            body: '1 song added to Playlist!',
            data: {
              songDetails: JSON.stringify({
                id: insertSong?.id || '',
                title: insertSong.title || '',
                artist: insertSong.artist || '',
                thumbnail: insertSong.thumbnail || '',
                added_by: insertSong.added_by || '',
                added_at: insertSong.added_at || '',
                ytUrl: insertSong.ytUrl || '',
                url: insertSong.url || '',
                playable: insertSong.playable || ''
              }),
            },
            event: 'playlist',
            code: 'add'
          },
          fcmToken: user?.fcm_token || ''
        })
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
    const { success, id, users, message } = await this.#getPlaylist(token);
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
    for (const user of (users || [])) {
      notification({
        message: {
          title: `-${deleteSong.count} Songs`,
          body: `${deleteSong.count} ${[0, 1].includes(deleteSong.count) ? 'song' : 'songs'} removed from Playlist`,
          data: {
            songId
          },
          event: 'playlist',
          code: 'delete'
        },
        fcmToken: user.fcm_token || ''
      })
    }
    return {
      success: true,
      message: 'Deleted Song!',
      count: deleteSong.count
    }
  }
  async #getPlaylist(token: string) {
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
        fcm_token: true,
        rooms: {
          select: {
            playlists: {
              select: {
                id: true
              }
            },
            users: {
              select: {
                fcm_token: true
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
      id: playlistId?.rooms?.playlists?.[0]?.id || '',
      message: 'found.',
      userId: data?.id,
      users: playlistId.rooms?.users
    }
  }
}