import { randomBytes, createHash, timingSafeEqual } from 'crypto';

export class CryptoUtil {
  /**
   * Generate a random bytes as hex string
   */
  static randomBytes(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a UUID v4
   */
  static uuid(): string {
    return randomBytes(16)
      .toString('hex')
      .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  }

  /**
   * Generate a nanoid (more URL-friendly than UUID)
   */
  static nanoId(length: number = 21): string {
    const chars =
      'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';
    const result: string[] = [];
    const bytes = randomBytes(length);

    for (let i = 0; i < length; i++) {
      result.push(chars[bytes[i] % chars.length]);
    }

    return result.join('');
  }

  /**
   * Create SHA256 hash
   */
  static sha256(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create MD5 hash (for non-security purposes)
   */
  static md5(data: string): string {
    return createHash('md5').update(data).digest('hex');
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  static safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);

    return timingSafeEqual(aBuffer, bBuffer);
  }

  /**
   * Encode data to base64
   */
  static base64Encode(data: string): string {
    return Buffer.from(data).toString('base64');
  }

  /**
   * Decode data from base64
   */
  static base64Decode(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8');
  }

  /**
   * Generate a numeric code of specified length
   */
  static generateNumericCode(length: number = 6): string {
    const max = Math.pow(10, length) - 1;
    const min = Math.pow(10, length - 1);
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    return code.toString().padStart(length, '0');
  }

  /**
   * Generate an alphanumeric code
   */
  static generateAlphanumericCode(length: number = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars
    const bytes = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }

    return result;
  }
}
