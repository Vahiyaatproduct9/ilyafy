import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import StreamModule from './stream/stream.module';
import { SessionGateway } from './gateways/session.gateway';
@Module({
  imports: [AuthModule, StreamModule, SessionGateway],
})
export class AppModule { }
