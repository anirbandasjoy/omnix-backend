import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = (request.headers['user-agent'] as string) || '';
    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`, {
      ip,
      userAgent,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse<Response>();
          this.logger.log(
            `Outgoing Response: ${method} ${url} - Status: ${response.statusCode} - ${duration}ms`,
          );
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const err = error as { message?: string };
          this.logger.error(
            `Request Failed: ${method} ${url} - ${duration}ms - ${err.message ?? 'Unknown error'}`,
          );
        },
      }),
    );
  }
}
