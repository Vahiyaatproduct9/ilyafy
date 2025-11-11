import { Controller, Get, Query, Res } from '@nestjs/common';
import StreamService from './stream.service';
import { Response } from 'express';

@Controller('stream')
export default class StreamController {
  constructor(private streamService: StreamService) { }

  @Get()
  async lol(@Query() query: {
    url: string
  }, @Res() res: Response) {
    await this.streamService.stream({ url: query.url, writable: res });
  }
}
