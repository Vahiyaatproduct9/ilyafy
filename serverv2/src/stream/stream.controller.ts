import { Controller, Get, Param } from '@nestjs/common';
import StreamService from './stream.service';

@Controller('stream')
export default class StreamController {
  constructor(private streamService: StreamService) { }

  @Get(':id')
  test(@Param('id') id: string) {
    return this.streamService.test(id);
  }
}
