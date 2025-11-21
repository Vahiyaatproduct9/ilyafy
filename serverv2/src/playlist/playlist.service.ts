import PLaylist from "@functions/playlist/PLaylist";
import { Injectable } from "@nestjs/common";
import { deleteType, listType, postType } from "types";

@Injectable({})
export default class PlaylistService {
  private playlist: PLaylist;
  constructor() {
    this.playlist = new PLaylist();
  }
  async get(id: string) {
    return await this.playlist.get(id);
  }
  async list({ headers }: listType) {
    return await this.playlist.list({ headers })
  }
  async delete({ headers, songId }: deleteType) {
    return await this.playlist.delete({ headers, songId })
  }
  async post({ headers, songInfo }: postType) {
    return await this.playlist.post({ headers, songInfo })
  }
}