import { IncomingHttpHeaders } from "http"

export type song = {
  id?: string;
  url: string;
  title: string;
  thumbnail: string;
  artist: string;
  playable: boolean;
  ytUrl: string;
}

export type roomPlaylist = {
  song: song;
  roomId: string;
  accessToken: string;
}

export type listType = {
  headers: IncomingHttpHeaders & { authorization: string } | undefined,
}
export type postBody = {
  url: string,
  title: string,
  thumbnail: string,
  artist: string,
  ytUrl: string,
}

export type postType = {
  headers: IncomingHttpHeaders & { authorization: string };
  body: postBody
}

export type deleteType = {
  headers: IncomingHttpHeaders & { authorization: string } | undefined;
  songId: string;
}