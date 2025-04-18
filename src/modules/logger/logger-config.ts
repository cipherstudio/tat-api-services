import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Log directory
const LOG_DIR = join(process.cwd(), 'logs');

// Environment variables with defaults
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_MAX_FILES = process.env.LOG_MAX_FILES || '30d';
const LOG_HTTP_MAX_FILES = process.env.LOG_HTTP_MAX_FILES || '14d';
const LOG_MAX_SIZE = process.env.LOG_MAX_SIZE || '20m';
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_NAME = process.env.APP_NAME || 'TAT API Services';

// Configure transports
const createTransports = () => {
  const transports: winston.transport[] = [
    // Console transport
    new winston.transports.Console({
      level: NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, context, trace }) => {
            return `${timestamp} [${level}] [${context || APP_NAME}] ${message}${
              trace ? `\n${trace}` : ''
            }`;
          },
        ),
      ),
    }),

    // Combined logs file
    new winston.transports.DailyRotateFile({
      level: LOG_LEVEL,
      dirname: LOG_DIR,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: LOG_MAX_FILES,
      maxSize: LOG_MAX_SIZE,
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
      maxFiles: LOG_MAX_FILES,
      maxSize: LOG_MAX_SIZE,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // HTTP request logs file
    new winston.transports.DailyRotateFile({
      level: LOG_LEVEL,
      dirname: LOG_DIR,
      filename: 'http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: LOG_HTTP_MAX_FILES,
      maxSize: LOG_MAX_SIZE,
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
  defaultMeta: { service: APP_NAME, environment: NODE_ENV },
  // Exception handling
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: LOG_MAX_FILES,
      maxSize: LOG_MAX_SIZE,
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
      maxFiles: LOG_MAX_FILES,
      maxSize: LOG_MAX_SIZE,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
