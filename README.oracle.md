# Oracle Database Configuration

This project has been configured to use Oracle Database instead of MySQL.

## Prerequisites

- Oracle Database client and server installed and running.
- Node.js and npm/yarn installed.

## Setup

1. **Install the required Oracle dependency:**

```bash
npm install oracledb --legacy-peer-deps
```

2. **Configure .env file with Oracle connection details:**

```
DB_HOST=82.29.167.110
DB_PORT=1521
DB_USERNAME=system
DB_PASSWORD=oracle123
DB_DATABASE=your_database
```

Replace `your_database` with the actual Oracle service name or SID.

## Additional Oracle Configuration

### Oracle Instant Client

For the `oracledb` Node.js driver to work, you need to have Oracle Instant Client installed on your system. Here's how to install it:

#### macOS:

```bash
# Using Homebrew
brew install instantclient-basic

# Set environment variables
export LD_LIBRARY_PATH=/usr/local/lib/instantclient
```

#### Linux:

```bash
# Download the appropriate package from Oracle website
# Extract and set environment variables
export LD_LIBRARY_PATH=/opt/oracle/instantclient_19_8
```

#### Windows:

Download the Instant Client from Oracle's website and add its directory to the PATH environment variable.

## TypeORM Oracle Configuration

The database connection has been configured in `src/modules/config/database.module.ts` with Oracle specific settings:

```typescript
{
  type: 'oracle',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  connectString: `${configService.get('DB_HOST')}:${configService.get('DB_PORT')}/${configService.get('DB_DATABASE')}`,
  // other config options...
}
```

## Migrations

When working with Oracle, you may need to adjust your migration scripts to use Oracle-specific SQL syntax. Oracle SQL has differences compared to MySQL in terms of data types, constraints, and SQL syntax.

To run migrations:

```bash
npm run migration:run
```

## Known Oracle Differences

- Oracle uses sequences for auto-increment functionality instead of AUTO_INCREMENT in MySQL
- Date/time handling is different
- String concatenation uses `||` instead of `+`
- Different function names for common operations
- Case sensitivity differences

## Troubleshooting

If you encounter issues with the Oracle connection:

1. Verify the Oracle service is running
2. Check your connectString format
3. Ensure Oracle Instant Client is properly installed
4. Review environment variables (LD_LIBRARY_PATH, PATH) 