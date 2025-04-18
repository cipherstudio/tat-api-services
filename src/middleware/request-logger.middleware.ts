import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;

      const message = `${method} ${originalUrl} ${statusCode} ${contentLength} - ${responseTime}ms - ${userAgent} ${ip}`;

      // Log metadata for better file filtering
      const logData = {
        type: 'http-request',
        ip,
        method,
        url: originalUrl,
        statusCode,
        contentLength,
        responseTime,
        userAgent,
      };

      // Log based on status code
      if (statusCode >= 500) {
        this.logger.error({ message, ...logData });
      } else if (statusCode >= 400) {
        this.logger.warn({ message, ...logData });
      } else {
        this.logger.log({ message, ...logData });
      }
    });

    next();
  }
}
