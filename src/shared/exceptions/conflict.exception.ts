import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class ConflictException extends BaseException {
  constructor(message: string, code?: string) {
    super(message, HttpStatus.CONFLICT, code || 'CONFLICT');
  }
}
