import { Body, Controller, Delete, Get, Headers, Post, Query } from "@nestjs/common";
import PlaylistService from "./playlist.service";
import { IncomingHttpHeaders } from "http";
import { song } from "types";

type httpHeader = IncomingHttpHeaders & { authorization: string };

type query = {
  song: song
}
type songId = { songId: string }
@Controller('playlist')
export default class PlaylistController {
  constructor(private playlist: PlaylistService) { }
  @Get()
  async get(@Query() query: {
    songId: string
  }) {
    return this.playlist.get(query.songId);
  }
  @Get('list')
  async list(@Headers() headers: httpHeader) {
    return this.playlist.list({ headers })
  }
  @Post()
  async post(@Body() query: query,
    @Headers() headers: httpHeader) {
    return this.playlist.post({ headers, songInfo: query.song })
  }
  @Delete()
  async delete(@Body() body: songId, @Headers() headers: any) {
    return this.playlist.delete({ headers, songId: body.songId })
  }
}