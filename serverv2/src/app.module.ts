import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import StreamModule from './stream/stream.module';
import { SessionGateway } from './gateways/session.gateway';
import PlaylistModule from './playlist/playlist.module';
import { LoggerMiddleware } from './middleware/log.middleware';
@Module({
  imports: [AuthModule, StreamModule, SessionGateway, PlaylistModule],

})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
  }
}
