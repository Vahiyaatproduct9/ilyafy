import { Body, Controller, Delete, Get, Headers, Post, Query } from "@nestjs/common";
import PlaylistService from "./playlist.service";
import { IncomingHttpHeaders } from "http";

type httpHeader = IncomingHttpHeaders & { authorization: string };

type body = {
  url: string
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
    console.log('token:', headers.authorization);
    return this.playlist.list({ headers })
  }
  @Post()
  async post(@Body() body: body,
    @Headers() headers: httpHeader) {
    return this.playlist.post({ headers, url: body.url })
  }
  @Delete()
  async delete(@Body() body: songId, @Headers() headers: any) {
    return this.playlist.delete({ headers, songId: body.songId })
  }
}