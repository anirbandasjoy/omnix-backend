import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
  errors?: ErrorDetail[];
}

export class ErrorBuilder {
  /**
   * Build a standardized error response
   */
  static build(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: ErrorDetail[],
  ): never {
    const response: ErrorResponse = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errors && errors.length > 0) {
      response.errors = errors;
    }

    throw new HttpException(response, statusCode);
  }

  /**
   * Build a not found error
   */
  static notFound(resource: string, identifier?: string): never {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    this.build(message, HttpStatus.NOT_FOUND);
  }

  /**
   * Build a bad request error
   */
  static badRequest(message: string, errors?: ErrorDetail[]): never {
    this.build(message, HttpStatus.BAD_REQUEST, errors);
  }

  /**
   * Build an unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized access'): never {
    this.build(message, HttpStatus.UNAUTHORIZED);
  }

  /**
   * Build a forbidden error
   */
  static forbidden(message: string = 'Forbidden'): never {
    this.build(message, HttpStatus.FORBIDDEN);
  }

  /**
   * Build a conflict error
   */
  static conflict(message: string): never {
    this.build(message, HttpStatus.CONFLICT);
  }

  /**
   * Build a validation error
   */
  static validation(errors: ErrorDetail[]): never {
    this.build('Validation failed', HttpStatus.UNPROCESSABLE_ENTITY, errors);
  }

  /**
   * Build an internal server error
   */
  static internal(message: string = 'Internal server error'): never {
    this.build(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
