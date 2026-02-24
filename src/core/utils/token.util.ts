import { randomBytes, createHash } from 'crypto';

interface UserPayload {
  id: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

export class TokenUtil {
  /**
   * Generate a verification token
   */
  static generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Generate a password reset token
   */
  static generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Hash a token for storage
   */
  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate a secure random string
   */
  static generateRandomString(length: number = 32): string {
    return randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  /**
   * Generate access token payload
   */
  static generateAccessTokenPayload(user: UserPayload, deviceId: string) {
    return {
      sub: user.id,
      email: user.email,
      roles: user.roles ?? [],
      permissions: user.permissions ?? [],
      deviceId,
      type: 'access',
    };
  }

  /**
   * Generate refresh token payload
   */
  static generateRefreshTokenPayload(userId: string, deviceId: string) {
    return {
      sub: userId,
      deviceId,
      type: 'refresh',
    };
  }

  /**
   * Extract token from authorization header
   */
  static extractTokenFromHeader(
    authHeader: string | undefined,
  ): string | undefined {
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Generate a fingerprint from user agent and IP
   */
  static generateFingerprint(userAgent: string, ip: string): string {
    const data = `${userAgent}:${ip}`;
    return createHash('sha256').update(data).digest('hex');
  }
}
