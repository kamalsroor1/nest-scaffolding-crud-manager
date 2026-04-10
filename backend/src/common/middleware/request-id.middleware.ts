import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware that attaches a unique request ID to each incoming request.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  /**
   * Generates a UUID and attaches it to req['requestId'] and X-Request-ID header.
   * @param req Express request
   * @param res Express response
   * @param next Next function
   */
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    req['requestId'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  }
}
