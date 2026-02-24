import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  // This guard will be configured via APP_GUARD provider pattern
  // extending the base ThrottlerGuard for future customization
}
