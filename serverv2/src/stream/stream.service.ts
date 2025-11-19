import { Injectable } from '@nestjs/common';
import getMetaData from '@functions/stream/getMetaData';
import audioStream from '@functions/stream/audioStream';
import { Response } from 'express';
@Injectable()
export default class StreamService {
  async stream({ url, writable }: { url: string, writable: Response }) {
    const metadata: any = await getMetaData({ url });
    const audioFormat = metadata.formats.find(
      f => f.acodec !== 'none' && f.vcodec === 'none' && f.protocol === 'https'
    );
    console.log('Audio Format:', audioFormat.url);
    if (audioFormat) {
      console.log('returning..')
      const res = await fetch(audioFormat.url, { method: 'HEAD' });
      console.log(res.status, res.ok, res.headers.get('Content-Type'));
      if (res.ok) {
        writable.json({
          success: true,
          ...audioFormat,
          thumbnail: metadata?.thumbnail || '',
          artist: metadata?.artist || metadata?.uploader || '',
          title: metadata?.title || '',
          duration: metadata?.duration || ''
        })
        return;
      } else {
        console.log('HEAD request failed, continuing to stream mode.'); writable.setHeader('Content-Type', audioFormat?.mime_type || 'audio/aac');
        writable.setHeader('Cache-Control', "no-cache");
        writable.setHeader('Connection', "keep-alive");
        writable.setHeader('Transfer-Encoding', 'chunked');
        if (audioFormat?.filesize) {
          writable.setHeader('Content-Length', audioFormat.filesize);
        }
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
        writable
      });
    } catch (err) {
      console.error('Error streaming audio:', err);
      return {
        success: false,
        message: 'Error streaming audio',
        error: err
      }
    }
  }
  async getInfo({ url, writable }: { url: string; writable: Response }) {
    const metadata: any = await getMetaData({ url });
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
