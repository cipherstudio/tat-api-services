import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || null,
    };

    // Include stack trace for 5xx errors in non-production environments
    if (status >= 500 && process.env.NODE_ENV !== 'production') {
      errorResponse['stack'] = exception.stack;
    }

    // Structured log data
    const logData = {
      type: 'http-exception',
      statusCode: status,
      path: request.url,
      method: request.method,
      query: request.query,
      body: this.sanitizeBody(request.body),
      ip: request.ip,
      userAgent: request.get('user-agent') || '',
    };

    // Log the error with different log levels based on status code
    const message = `${request.method} ${request.url} ${status} - Error: ${exception.message}`;
    if (status >= 500) {
      this.logger.error({ message, ...logData }, exception.stack);
    } else if (status >= 400) {
      this.logger.warn({ message, ...logData });
    } else {
      this.logger.log({ message, ...logData });
    }

    response.status(status).json(errorResponse);
  }

  // Sanitize sensitive data from request bodies
  private sanitizeBody(body: any): any {
    if (!body) return {};

    const sanitized = { ...body };

    // List of fields to sanitize
    const sensitiveFields = [
      'password',
      'passwordConfirmation',
      'token',
      'refreshToken',
      'secret',
    ];

    // Recursively check and sanitize sensitive fields
    const sanitizeObj = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      Object.keys(obj).forEach((key) => {
        if (sensitiveFields.includes(key)) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitizeObj(obj[key]);
        }
      });
    };

    sanitizeObj(sanitized);
    return sanitized;
  }
}
