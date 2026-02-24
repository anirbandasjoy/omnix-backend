import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Support REDIS_URL for services like Upstash, Redis Cloud
        const redisUrl = config.get('redis.url');
        const redisHost = config.get('redis.host', 'localhost');
        const redisPort = config.get('redis.port', 6379);
        const redisPassword = config.get('redis.password');
        const redisDb = config.get('redis.db', 1);

        // If REDIS_URL is provided, use it directly
        if (redisUrl && redisUrl.includes('rediss://')) {
          // For secure Redis (like Upstash with TLS)
          return {
            redis: {
              host: redisHost,
              port: redisPort,
              password: redisPassword,
              db: redisDb,
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
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            db: redisDb,
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
