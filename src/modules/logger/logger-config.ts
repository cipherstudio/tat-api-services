import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { join } from 'path';

// Log directory
const LOG_DIR = join(process.cwd(), 'logs');

// Configure transports
const createTransports = () => {
  const transports: winston.transport[] = [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, context, trace }) => {
            return `${timestamp} [${level}] [${context || 'Application'}] ${message}${
              trace ? `\n${trace}` : ''
            }`;
          },
        ),
      ),
    }),

    // Combined logs file
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d', // Keep logs for 30 days
      maxSize: '20m', // 20 MB per file
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // Error logs file
    new winston.transports.DailyRotateFile({
      level: 'error',
      dirname: LOG_DIR,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d', // Keep error logs for 30 days
      maxSize: '20m', // 20 MB per file
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // HTTP request logs file
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // Keep HTTP logs for 14 days
      maxSize: '20m', // 20 MB per file
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ];

  return transports;
};

// Create winston logger configuration
export const loggerConfig = {
  transports: createTransports(),
  // Default meta data for log messages
  defaultMeta: { service: 'tat-api-services' },
  // Exception handling
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, trace }) => {
          return `${timestamp} [${level}] [Exception] ${message}\n${trace}`;
        }),
      ),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
