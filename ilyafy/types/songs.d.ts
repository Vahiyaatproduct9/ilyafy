export type songProp = {
  index: number;
  title: string;
  artist: string;
  url: string;
  ytLink: string;
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