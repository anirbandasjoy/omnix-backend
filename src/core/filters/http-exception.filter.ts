import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  path: string;
  method: string;
  timestamp: string;
  correlationId: string;
  stack?: string;
  errors?: unknown;
}

interface ExceptionResponseObject {
  message?: string | string[];
  errors?: unknown;
  [key: string]: unknown;
}

interface LogData {
  statusCode: number;
  message: string;
  path: string;
  method: string;
  correlationId: string;
  userAgent?: string;
  ip?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId =
      (request.headers['x-correlation-id'] as string) || uuidv4();
    response.setHeader('x-correlation-id', correlationId);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as ExceptionResponseObject)?.message ||
          exception.message
        : 'Internal server error';

    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: status,
      message: message as string,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    // Extract validation errors if present
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as
        | string
        | ExceptionResponseObject;
      if (
        typeof exceptionResponse === 'object' &&
        'errors' in exceptionResponse
      ) {
        errorResponse.errors = exceptionResponse.errors;
      }
    }

    // Log error details
    this.logError(exception, request, errorResponse);

    // Don't expose stack traces in production
    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }

  private logError(
    exception: unknown,
    request: Request,
    errorResponse: ErrorResponse,
  ): void {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : '';

    const logData: LogData = {
      statusCode: errorResponse.statusCode,
      message,
      path: request.url,
      method: request.method,
      correlationId: errorResponse.correlationId,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${message}`,
        stack || exception,
        logData,
      );
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${message}`,
        logData,
      );
    }
  }
}
