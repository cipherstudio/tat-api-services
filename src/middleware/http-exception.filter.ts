import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else {
      // Handle database connection errors
      if (exception.code === 'ECONNRESET' || exception.errno === -104) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database connection lost. Please try again.';
      } else if (exception.code === 'ETIMEDOUT') {
        status = HttpStatus.REQUEST_TIMEOUT;
        message = 'Request timeout. Please try again.';
      } else if (exception.message) {
        message = exception.message;
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
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
    const logMessage = `${request.method} ${request.url} ${status} - Error: ${message}`;
    if (status >= 500) {
      this.logger.error({ message: logMessage, ...logData }, exception.stack);
    } else if (status >= 400) {
      this.logger.warn({ message: logMessage, ...logData });
    } else {
      this.logger.log({ message: logMessage, ...logData });
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
