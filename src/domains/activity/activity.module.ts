import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../core/database';
import { CacheModule } from '../../core/cache';
import { ActivityService } from './services/activity.service';
import { ActivityRepository } from './repositories/activity.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CacheModule,
    forwardRef(() => UserModule),
  ],
  providers: [ActivityService, ActivityRepository],
  exports: [ActivityService, ActivityRepository],
})
export class ActivityModule {}
