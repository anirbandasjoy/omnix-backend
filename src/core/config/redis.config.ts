import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => {
  // Support REDIS_URL for services like Upstash, Redis Cloud
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    // Parse REDIS_URL to extract individual components for backward compatibility
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      clusterMode: process.env.REDIS_CLUSTER_MODE === 'true',
      url: redisUrl,
    };
  }

  // Fallback to individual environment variables
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    clusterMode: process.env.REDIS_CLUSTER_MODE === 'true',
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
  };
});
