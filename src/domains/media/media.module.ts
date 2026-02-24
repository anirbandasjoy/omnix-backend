import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../core/database';
import { CacheModule } from '../../core/cache';
import { InfrastructureModule } from '../../infrastructure';
import { JwtCoreModule } from '../../core/jwt/jwt.module';
import { MediaService } from './services/media.service';
import { MediaController } from '../../presentation/http/v1/media/media.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    JwtCoreModule,
    ConfigModule,
    DatabaseModule,
    CacheModule,
    InfrastructureModule,
    forwardRef(() => ActivityModule),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
