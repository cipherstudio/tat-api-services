# Oracle Database Migration

This document outlines the changes made to migrate the database from MySQL to Oracle in this project.

## Changes Made

1. **Installed Oracle Database Driver**:
   ```bash
   npm install oracledb --legacy-peer-deps
   ```

2. **Updated Environment Variables** (.env file):
   ```
   DB_HOST=82.29.167.110
   DB_PORT=1521
   DB_USERNAME=system
   DB_PASSWORD=oracle123
   DB_DATABASE=XE
   ```

3. **Modified Database Configuration** (src/modules/config/database.module.ts):
   - Changed database type from 'mysql' to 'oracle'
   - Added Oracle-specific connectString configuration

4. **Updated Entity Definitions** to be Oracle Compatible:
   - Changed 'enum' types to 'varchar' with appropriate length
   - Changed 'json' and 'text' types to 'clob' for Oracle compatibility

5. **Created Oracle Helper Utilities** (src/database/oracle-helper.ts):
   - Added functions for handling Oracle-specific data types
   - Implemented pagination helpers for Oracle
   - Added sequence creation helpers for auto-increment functionality

6. **Added Oracle Connection Test Script** (scripts/test-oracle-connection.ts):
   - Created a script to verify Oracle connection
   - Added npm script 'test:oracle' to package.json

## Testing

The Oracle connection has been tested successfully. The test script connects to the Oracle database and executes a simple query.

## Oracle-Specific Considerations

When working with Oracle instead of MySQL, be aware of these differences:

1. **Auto-increment Fields**: Oracle uses sequences instead of AUTO_INCREMENT
2. **Data Types**: 
   - TEXT → CLOB
   - JSON → CLOB (with manual serialization/deserialization)
   - ENUM → VARCHAR (with manual validation)

3. **Pagination**: Oracle uses a different approach for pagination:
   ```sql
   SELECT * FROM (
     SELECT a.*, ROWNUM rnum FROM (
       ${baseQuery}
     ) a WHERE ROWNUM <= ${offset + limit}
   ) WHERE rnum > ${offset}
   ```

4. **Case Sensitivity**: Oracle identifiers are case-sensitive by default when quoted.

## Future Considerations

For a complete migration, consider these additional steps:

1. Review and modify all custom SQL queries in the code
2. Test all database operations thoroughly
3. Create Oracle-specific migrations for existing database schema
4. Implement proper sequences for auto-increment fields
5. Review and optimize indexing strategy for Oracle 