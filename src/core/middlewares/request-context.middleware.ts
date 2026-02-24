import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare module 'express' {
  interface Request {
    id?: string;
    correlationId?: string;
  }
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.id = (req.headers['x-request-id'] as string) || uuidv4();
    req.correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();

    res.setHeader('x-request-id', req.id);
    res.setHeader('x-correlation-id', req.correlationId);

    next();
  }
}
