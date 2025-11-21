import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import StreamModule from './stream/stream.module';
import { SessionGateway } from './gateways/session.gateway';
import PlaylistModule from './playlist/playlist.module';
@Module({
  imports: [AuthModule, StreamModule, SessionGateway, PlaylistModule],
})
export class AppModule { }
