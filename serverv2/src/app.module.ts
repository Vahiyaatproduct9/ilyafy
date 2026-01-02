import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import StreamModule from './stream/stream.module';
import { SessionGateway } from './gateways/session.gateway';
import PlaylistModule from './playlist/playlist.module';
import { LoggerMiddleware } from './middleware/log.middleware';
import { AdminModule } from './admin/admin.module';
import { AccessTokenCheck } from './middleware/accessToken.middleware';
import { FeedbackModule } from './feedback/feedback.module';
import RateLimiter from './middleware/rateLimiter.middleware';
@Module({
  imports: [AuthModule, StreamModule, SessionGateway, PlaylistModule, AdminModule, FeedbackModule],

})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, RateLimiter)
      .exclude({
        path: 'playlist',
        method: RequestMethod.GET
      })
      .forRoutes('*')
    consumer.apply(AccessTokenCheck)
      .forRoutes(
        'auth/users/roommate',
        'auth/users/poke',
        'auth/users/connect',
        'feedback'
      )
  }
}
