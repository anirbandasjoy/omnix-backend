import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret:
    process.env.JWT_ACCESS_SECRET ||
    'your-super-secret-access-key-change-in-production-min-32-chars',
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshSecret:
    process.env.REFRESH_TOKEN_SECRET ||
    'your-super-secret-refresh-key-change-in-production-min-32-chars',
  refreshExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
  verificationExpiration: process.env.VERIFICATION_TOKEN_EXPIRATION || '24h',
  passwordResetExpiration: process.env.PASSWORD_RESET_TOKEN_EXPIRATION || '1h',
}));
