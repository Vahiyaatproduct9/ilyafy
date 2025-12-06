export type songProp = {
  id: string;
  mediaId?: string;
  title: string;
  artist: string;
  url: string;
  ytUrl: string;
  thumbnail: string;
  playable: boolean;
  duration?: number;
}
export type PlaylistProp = songProp[];
export type InfoResponseProp = {
  title: string | null;
  url: string | null;
  ext: string | null;
  artist: string | null;
  playable: boolean | null;
  thumbnail: string | null;
  success: boolean;
}
