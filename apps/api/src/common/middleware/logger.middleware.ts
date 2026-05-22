import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    const { method, originalUrl } = request;
    response.on('finish', () => {
      const { statusCode } = response;
      this.logger.log(`${method} ${originalUrl} ${statusCode}`);
    });
    next();
  }
}
