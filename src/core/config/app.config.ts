import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  name: process.env.APP_NAME || 'Auth2X Ultra',
  url: process.env.APP_URL || 'http://localhost:3000',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    prettyPrint: process.env.LOG_PRETTY_PRINT === 'true',
  },
}));
