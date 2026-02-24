import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('redis.host', 'localhost'),
        port: config.get('redis.port', 6379),
        password: config.get('redis.password'),
        db: config.get('redis.db', 0),
        ttl: config.get('redis.ttl', 300),
      }),
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
