import { Controller, Get, Headers, Patch, Query, Res } from '@nestjs/common';
import StreamService from './stream.service';
import { Response } from 'express';
import { IncomingHttpHeaders } from 'http';

@Controller('stream')
export default class StreamController {
  constructor(private streamService: StreamService) { }

  @Get()
  async lol(@Query() query: {
    url: string
  }, @Res() res: Response) {
    await this.streamService.stream({ url: query.url, writable: res });
  }
  @Patch()
  async patch(@Query() query: {
    id: string;
  }, @Headers() headers: IncomingHttpHeaders,
    @Res() writable: Response) {
    await this.streamService.update({ songId: query?.id || '', headers, writable })
  }
  @Get('song')
  async getInfo(@Query() query: {
    url: string
  }, @Res() res: Response) {
    await this.streamService.getInfo({ url: query.url, writable: res });
  }
}
