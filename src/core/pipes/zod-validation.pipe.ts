import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { z } from 'zod';

interface ZodError {
  field: string;
  message: string;
  code: string;
}

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (
      metadata.type !== 'body' &&
      metadata.type !== 'query' &&
      metadata.type !== 'param'
    ) {
      return value;
    }

    try {
      const result = this.schema.safeParse(value);

      if (!result.success) {
        const errors = this.formatErrors(result.error.issues);
        throw new BadRequestException({
          success: false,
          statusCode: 400,
          message: 'Validation failed',
          errors,
          timestamp: new Date().toISOString(),
        });
      }

      return result.data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Validation error');
    }
  }

  private formatErrors(zodErrors: z.ZodIssue[]): ZodError[] {
    return zodErrors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }
}
