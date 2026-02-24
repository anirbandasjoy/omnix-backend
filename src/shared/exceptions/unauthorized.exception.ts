import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
  }
}
