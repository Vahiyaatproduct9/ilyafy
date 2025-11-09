import { Injectable } from '@nestjs/common';

@Injectable()
export default class StreamService {
  test(id: string) {
    return `<h1>Heyyy! ${id}</h1>`;
  }
}
