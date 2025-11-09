import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import StreamModule from './stream/stream.module';
@Module({
  imports: [AuthModule, StreamModule],
})
export class AppModule { }
