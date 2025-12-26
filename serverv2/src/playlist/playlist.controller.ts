import { Body, Controller, Delete, Get, Headers, Post, Query } from "@nestjs/common";
import PlaylistService from "./playlist.service";
import { IncomingHttpHeaders } from "http";

type httpHeader = IncomingHttpHeaders & { authorization: string };

type body = {
  url: string,
  title: string,
  thumbnail: string,
  artist: string,
  ytUrl: string,
}
type songId = { songId: string }
@Controller('playlist')
export default class PlaylistController {
  constructor(private playlist: PlaylistService) { }
  @Get()
  async get(@Query() query: {
    songId: string
  }) {
    return await this.playlist.get(query.songId);
  }
  @Get('list')
  async list(@Headers() headers: httpHeader) {
    return await this.playlist.list({ headers })
  }
  @Post()
  async post(@Body() body: body,
    @Headers() headers: httpHeader) {
    return await this.playlist.post({ headers, body })
  }
  @Delete()
  async delete(@Body() body: songId, @Headers() headers: any) {
    return await this.playlist.delete({ headers, songId: body.songId })
  }
}