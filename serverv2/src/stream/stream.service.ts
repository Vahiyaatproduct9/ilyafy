import { Injectable } from '@nestjs/common';
import getMetaData from '@functions/stream/getMetaData';
import audioStream from '@functions/stream/audioStream';
import { Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import prisma from '@libs/prisma';
import { verifyToken } from '@functions/secret/JWT';
import { configDotenv } from 'dotenv';
import { log } from 'console';
configDotenv();
@Injectable()
export default class StreamService {
  async stream({ url, writable, songId }: { url: string, writable: Response, songId?: string }) {
    // const metadata: any = undefined;
    const metadata: any = await getMetaData({ url });
    const audioFormat = metadata?.formats?.find(
      f => f.acodec !== 'none' && f.vcodec === 'none' && f.protocol === 'https'
    );
    console.log('Audio Format:', audioFormat?.url);
    if (songId) {
      writable.setHeader("X-Id", songId);
      await prisma.songs.update({
        where: {
          id: songId,
        }, data: {
          url: audioFormat?.url || ''
        }
      })
    }
    if (audioFormat) {
      const res = await fetch(audioFormat?.url, { method: 'HEAD' });
      console.log(res.status, res.ok, res.headers.get('Content-Type'));
      if (res.ok) {
        // if (false) {
        writable.json({
          success: true,
          ...audioFormat,
          thumbnail: metadata?.thumbnail || '',
          artist: metadata?.artist || metadata?.uploader || '',
          title: metadata?.title || '',
          duration: metadata?.duration || '',
          id: songId || undefined
        })
        return;
      } else {
        console.log('HEAD request failed, continuing to stream mode.');
        log('content length:', audioFormat?.filesize);
        writable.setHeader('Content-Type', audioFormat?.mime_type || 'audio/aac');
        writable.setHeader('Cache-Control', "no-cache");
        writable.setHeader('Connection', "keep-alive");
        writable.setHeader('Transfer-Encoding', 'chunked');
        writable.setHeader('Content-Length', parseInt(audioFormat?.filesize || '0'));
        writable.setHeader("X-Track-Thumb", metadata?.thumbnail || "");
        writable.setHeader("X-Track-Artist", metadata?.artist || metadata?.uploader || "");
        writable.setHeader("X-Track-Title", metadata?.title || "");
        writable.setHeader("X-Track-Duration", metadata?.duration || "");
        writable.flushHeaders?.();
      }
    }
    try {
      await audioStream({
        url,
        writable,
        // proxy: process.env.PROXY_SAMPLE || ''
      });
    } catch (err) {
      console.error('Error streaming audio:', err);
      writable.json({
        success: false,
        message: 'Error streaming audio',
        error: err
      })
      return;
    }
  }
  async update({ songId, headers, writable }: { songId: string; headers: IncomingHttpHeaders; writable: Response }) {
    const token = headers.authorization?.split(' ')[1] || '';
    const { success, message } = verifyToken(token);
    if (!success) {
      writable.json({
        success, message
      });
      return;
    }
    const song = await prisma.songs.findUnique({
      where: {
        id: songId
      }, select: {
        ytUrl: true,
        title: true,
        artist: true
      }
    });
    if (!song) {
      writable.json({
        success: false,
        message: 'No song with this ID found :('
      });
      return;
    }
    console.log('updateing song:', song.title, 'by', song.artist);
    await this.stream({ url: song.ytUrl, writable, songId });
  }

  async getInfo({ url, writable }: { url: string; writable: Response }) {
    const metadata: any = await getMetaData({ url, proxy: undefined });
    const audioFormat = metadata.formats.find(
      f => f.acodec !== 'none' && f.vcodec === 'none' && f.protocol === 'https'
    );
    if (!audioFormat) {
      writable.json({
        success: false,
        message: 'Cannot find Streamable Service, Please choose another song!'
      })
      return;
    }
    const { ok } = await fetch(audioFormat?.url, { method: 'HEAD' })
    writable.json({
      thumbnail: metadata?.thumbnail || null,
      artist: metadata?.artist || metadata?.uploader || null,
      title: metadata?.title || null,
      duration: metadata?.duration || null,
      success: true,
      ...audioFormat,
      playable: ok ? true : false
    })
    return;
  }
}
