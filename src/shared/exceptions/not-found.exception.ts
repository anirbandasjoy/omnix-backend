import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';

export class NotFoundException extends BaseException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND, 'RESOURCE_NOT_FOUND');
  }
}
