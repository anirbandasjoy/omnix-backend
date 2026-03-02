import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '../config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const envCfg = config.get<EnvConfig>('env')!;
        const redis = envCfg.REDIS;

        // If REDIS.URL is provided and contains rediss:// (secure Redis)
        if (redis.URL && redis.URL.includes('rediss://')) {
          // For secure Redis (like Upstash with TLS)
          return {
            redis: {
              host: redis.HOST,
              port: redis.PORT,
              password: redis.PASSWORD,
              db: redis.DB,
              tls: {} as any, // Enable TLS for Upstash/Redis Cloud
            },
            defaultJobOptions: {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
              removeOnComplete: {
                count: 1000,
                age: 7 * 24 * 3600, // 7 days
              },
              removeOnFail: {
                count: 5000,
                age: 30 * 24 * 3600, // 30 days
              },
            },
          };
        }

        // For standard Redis connection
        return {
          redis: {
            host: redis.HOST,
            port: redis.PORT,
            password: redis.PASSWORD,
            db: redis.DB,
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: {
              count: 1000,
              age: 7 * 24 * 3600, // 7 days
            },
            removeOnFail: {
              count: 5000,
              age: 30 * 24 * 3600, // 30 days
            },
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
