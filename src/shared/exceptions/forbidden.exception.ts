import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN, 'FORBIDDEN');
  }
}
