import { registerAs } from '@nestjs/config';
import { FlattenObjectKeys, NestedValue } from '@/types/object';

export const envConfig = () => ({
  // ============================================================================
  // APP
  // ============================================================================
  APP: {
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
    PORT: parseInt(process.env.PORT || '3000', 10),
    API_PREFIX: process.env.API_PREFIX || 'api',
    NAME: process.env.APP_NAME,
    URL: process.env.APP_URL,
    CORS: {
      ORIGIN: process.env.CORS_ORIGIN,
      CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
    },
    THROTTLE: {
      TTL: parseInt(process.env.THROTTLE_TTL || '60', 10),
      LIMIT: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },
    LOGGING: {
      LEVEL: process.env.LOG_LEVEL || 'info',
      PRETTY_PRINT: process.env.LOG_PRETTY_PRINT === 'true',
    },
  },

  // ============================================================================
  // DATABASE
  // ============================================================================
  DATABASE: {
    HOST: process.env.DB_HOST,
    PORT: parseInt(process.env.DB_PORT || '5432', 10),
    NAME: process.env.DB_NAME,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    SSL: process.env.DB_SSL === 'true',
    POOL: {
      MIN: parseInt(process.env.DB_POOL_MIN || '2', 10),
      MAX: parseInt(process.env.DB_POOL_MAX || '10', 10),
    },
    URL:
      process.env.DATABASE_URL ||
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  },

  // ============================================================================
  // REDIS
  // ============================================================================
  REDIS: {
    HOST: process.env.REDIS_HOST,
    PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    PASSWORD: process.env.REDIS_PASSWORD,
    DB: parseInt(process.env.REDIS_DB || '0', 10),
    TLS: process.env.REDIS_TLS === 'true',
    URL:
      process.env.REDIS_URL ||
      `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  },

  // ============================================================================
  // JWT
  // ============================================================================
  JWT: {
    ACCESS: {
      SECRET: process.env.JWT_ACCESS_SECRET,
      EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
    },
    REFRESH: {
      SECRET: process.env.REFRESH_TOKEN_SECRET,
      EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
    },
    VERIFICATION: {
      EXPIRATION: process.env.VERIFICATION_TOKEN_EXPIRATION || '24h',
    },
    PASSWORD_RESET: {
      EXPIRATION: process.env.PASSWORD_RESET_TOKEN_EXPIRATION || '1h',
    },
  },

  // ============================================================================
  // OAUTH
  // ============================================================================
  OAUTH: {
    GOOGLE: {
      CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    },
    GITHUB: {
      CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    },
  },

  // ============================================================================
  // EMAIL
  // ============================================================================
  EMAIL: {
    SMTP: {
      HOST: process.env.EMAIL_HOST,
      PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
      USER: process.env.EMAIL_USER,
      PASSWORD: process.env.EMAIL_PASSWORD,
      FROM: process.env.EMAIL_FROM,
      FROM_NAME: process.env.EMAIL_FROM_NAME,
    },
  },

  // ============================================================================
  // AWS
  // ============================================================================
  AWS: {
    REGION: process.env.AWS_REGION,
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3: {
      BUCKET: process.env.AWS_S3_BUCKET,
    },
    CDN: {
      URL: process.env.AWS_CDN_URL,
    },
  },
});

export default envConfig;
export type EnvConfig = ReturnType<typeof envConfig>;
export type EnvConfigFlat = {
  [P in FlattenObjectKeys<EnvConfig>]: NestedValue<EnvConfig, P>;
};

// NestJS ConfigService wrapper (best practice)
export const config = registerAs('env', envConfig);
