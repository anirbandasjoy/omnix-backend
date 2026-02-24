import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(message: string, statusCode: HttpStatus, code?: string) {
    super(
      {
        success: false,
        statusCode,
        message,
        ...(code && { code }),
      },
      statusCode,
    );
  }
}
