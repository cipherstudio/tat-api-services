//eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

module.exports = {
  development: {
    client: 'oracledb',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      schema: process.env.DB_SCHEMA,
      port: parseInt(process.env.DB_PORT || '1521', 10),
      connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST})(PORT=${process.env.DB_PORT || '1521'}))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=${process.env.DB_DATABASE})))`,
      // Oracle specific connection options
      connectTimeout: 10000, // ลดจาก 30000 เป็น 10000 เพื่อ fail fast
      requestTimeout: 30000,
      poolTimeout: 10000, // ลดจาก 30000 เป็น 10000 เพื่อ fail fast
      // Enable connection pooling
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
      poolPingInterval: 60,
      // Retry configuration
      retryCount: 3,
      retryInterval: 1000,
    },
    // Connection pool configuration
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 10000, // ลดจาก 30000 เป็น 10000 เพื่อ fail fast
      createTimeoutMillis: 10000, // ลดจาก 30000 เป็น 10000 เพื่อ fail fast
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    },
    migrations: {
      directory: './knex/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './knex/seeds',
    },
  },
};
