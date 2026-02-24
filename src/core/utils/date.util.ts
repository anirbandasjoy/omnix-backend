export class DateUtil {
  /**
   * Add seconds to a date
   */
  static addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1000);
  }

  /**
   * Add minutes to a date
   */
  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  /**
   * Add hours to a date
   */
  static addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  /**
   * Add days to a date
   */
  static addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Check if a date is in the past
   */
  static isPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Check if a date is in the future
   */
  static isFuture(date: Date): boolean {
    return date > new Date();
  }

  /**
   * Check if a date has expired
   */
  static isExpired(date: Date): boolean {
    return this.isPast(date);
  }

  /**
   * Get the difference in seconds between two dates
   */
  static diffInSeconds(date1: Date, date2: Date): number {
    return Math.floor((date1.getTime() - date2.getTime()) / 1000);
  }

  /**
   * Get the difference in minutes between two dates
   */
  static diffInMinutes(date1: Date, date2: Date): number {
    return Math.floor(this.diffInSeconds(date1, date2) / 60);
  }

  /**
   * Get the difference in days between two dates
   */
  static diffInDays(date1: Date, date2: Date): number {
    return Math.floor(this.diffInHours(date1, date2) / 24);
  }

  /**
   * Get the difference in hours between two dates
   */
  static diffInHours(date1: Date, date2: Date): number {
    return Math.floor(this.diffInMinutes(date1, date2) / 60);
  }

  /**
   * Format date to ISO string
   */
  static toISOString(date: Date): string {
    return date.toISOString();
  }

  /**
   * Format date to human-readable string
   */
  static toReadableString(date: Date, locale: string = 'en-US'): string {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Parse a string to date
   */
  static parse(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Get current timestamp in seconds
   */
  static nowInSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Get current timestamp in milliseconds
   */
  static nowInMs(): number {
    return Date.now();
  }

  /**
   * Create a date from timestamp in seconds
   */
  static fromSeconds(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }

  /**
   * Create a date from timestamp in milliseconds
   */
  static fromMs(timestamp: number): Date {
    return new Date(timestamp);
  }
}
