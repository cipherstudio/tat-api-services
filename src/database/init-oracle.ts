import * as oracledb from 'oracledb';
import { Logger } from '@nestjs/common';

/**
 * Initialize Oracle database configuration
 */
export async function initOracleConfig(): Promise<void> {
  const logger = new Logger('OracleInitializer');

  try {
    // Set Oracle client directory if using Instant Client
    // oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });

    // Configure connection pool
    await oracledb.createPool({
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST})(PORT=${process.env.DB_PORT}))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=${process.env.DB_DATABASE})))`,
      poolIncrement: 1,
      poolMax: 10,
      poolMin: 1,
      poolTimeout: 60,
    });

    // Configure Oracle to fetch CLOB as String
    oracledb.fetchAsString = [oracledb.CLOB];

    // Configure auto-commit
    oracledb.autoCommit = true;

    logger.log('Oracle database initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize Oracle: ${error.message}`, error.stack);
    throw error;
  }
}

/**
 * Close Oracle connection pools
 */
export async function closeOracleConnections(): Promise<void> {
  const logger = new Logger('OracleInitializer');

  try {
    await oracledb.getPool().close(10);
    logger.log('Oracle connections closed successfully');
  } catch (error) {
    logger.error(
      `Error closing Oracle connections: ${error.message}`,
      error.stack,
    );
  }
}
