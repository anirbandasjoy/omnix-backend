import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import type { EnvConfig } from '../config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (config: ConfigService) => {
        const envCfg = config.get<EnvConfig>('env')!;
        return {
          store: redisStore,
          host: envCfg.REDIS.HOST,
          port: envCfg.REDIS.PORT,
          password: envCfg.REDIS.PASSWORD,
          db: envCfg.REDIS.DB,
          ttl: 300,
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
