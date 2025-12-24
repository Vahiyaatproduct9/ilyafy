import { Track } from "react-native-track-player";

export type songProp = {
  id: string;
  title: string;
  artist: string;
  url: string;
  ytUrl: string;
  thumbnail: string;
  playable: boolean;
  duration?: number;
}
export type CTrack = Track & {
  localPath?: string | null;
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

// types/newpipe.ts

/**
 * Represents a single thumbnail with dimensions
 */
export interface Thumbnail {
  url: string;
  height: number;
  width: number;
}

/**
 * Represents an audio stream with all metadata
 */
export interface AudioStream {
  url: string;
  bitrate: number;
  format: string;
  formatId: number;
  codec: string;
  quality: string;
}

/**
 * Represents a video stream with all metadata
 */
export interface VideoStream {
  url: string;
  resolution: string;
  format: string;
  formatId: number;
  codec: string;
  quality: string;
}

/**
 * Represents a related/suggested video
 */
export interface RelatedStream {
  name: string;
  url: string;
  uploaderName: string;
}

/**
 * Main response from NewPipe extraction
 */
export interface NewPipeStreamInfo {
  // Basic video info
  title: string;
  description?: string;
  uploadDate?: string;
  uploader: string;
  uploaderUrl: string;
  uploaderAvatarUrl?: string;

  // Statistics
  duration: number;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  subscriberCount: number;

  // Metadata
  category: string;
  ageLimit: number;
  tags: string[];

  // Thumbnails
  thumbnails: Thumbnail[];
  thumbnailUrl?: string; // Best/first thumbnail as fallback

  // Streams
  audioStream?: AudioStream; // Best audio stream
  audioStreams: AudioStream[]; // All audio streams
  videoStreams: VideoStream[]; // Video+Audio combined streams
  videoOnlyStreams: VideoStream[]; // Video-only streams (for high quality)

  // Related content
  relatedStreams: RelatedStream[];
}