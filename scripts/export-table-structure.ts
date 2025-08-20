import * as oracledb from 'oracledb';
import * as fs from 'fs';
import * as path from 'path';

async function exportTableStructure() {
  let connection;

  try {
    console.log('🔌 Connecting to Oracle database...');
    console.log('📍 Trying different connection methods...');

    // Try different connection methods
    const connectionMethods = [
      // Method 1: Using SID instead of SERVICE_NAME
      {
        name: 'SID Method',
        connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SID=TAT_DEV)))`,
      },
      // Method 2: Using SERVICE_NAME with XE (common default)
      {
        name: 'SERVICE_NAME XE Method',
        connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=XE)))`,
      },
      // Method 3: Using SID with XE
      {
        name: 'SID XE Method',
        connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SID=XE)))`,
      },
      // Method 4: Simple connection string
      {
        name: 'Simple Method',
        connectString: 'localhost:1521/TAT_DEV',
      },
      // Method 5: Simple with XE
      {
        name: 'Simple XE Method',
        connectString: 'localhost:1521/XE',
      },
    ];

    let connected = false;
    let lastError;

    for (const method of connectionMethods) {
      try {
        console.log(`🔄 Trying ${method.name}...`);
        console.log(`🔗 Connection string: ${method.connectString}`);

        connection = await oracledb.getConnection({
          user: 'TAT_DEV',
          password: 'Bookaso29',
          connectString: method.connectString,
        });

        console.log(`✅ Connected successfully using ${method.name}!`);
        connected = true;
        break;
      } catch (error) {
        lastError = error;
        console.log(`❌ ${method.name} failed: ${error.message}`);

        if (connection) {
          try {
            await connection.close();
            connection = null;
          } catch (closeError) {
            // Ignore close errors
          }
        }
      }
    }

    if (!connected) {
      throw new Error(
        `All connection methods failed. Last error: ${lastError?.message}`,
      );
    }

    // First, let's check what tables exist and their structure
    console.log('🔍 Checking database schema...');

    // Get list of all tables
    const tablesQuery = `
      SELECT TABLE_NAME
      FROM USER_TABLES
      ORDER BY TABLE_NAME
    `;

    const tablesResult = await connection.execute(tablesQuery);
    const tables = tablesResult.rows?.map((row: any) => row[0]) || [];

    console.log(`📋 Found ${tables.length} tables`);

    if (tables.length === 0) {
      console.log('❌ No tables found in the database');
      return;
    }

    // Show first few tables
    console.log('\n📋 First 10 tables:');
    tables.slice(0, 10).forEach((table) => console.log(`  - ${table}`));

    // Get all columns for all tables
    const columnsQuery = `
      SELECT
        c.TABLE_NAME as "Table Name",
        c.COLUMN_NAME as "Column Name",
        c.DATA_TYPE as "Data Type",
        c.NULLABLE as "Nullable",
        c.DATA_LENGTH as "Length",
        c.DATA_PRECISION as "Precision",
        c.DATA_SCALE as "Scale",
        c.DATA_DEFAULT as "Default",
        cc.COMMENTS as "Comments"
      FROM USER_TAB_COLUMNS c
      LEFT JOIN USER_COL_COMMENTS cc ON c.TABLE_NAME = cc.TABLE_NAME AND c.COLUMN_NAME = cc.COLUMN_NAME
      ORDER BY c.TABLE_NAME, c.COLUMN_ID
    `;

    console.log('🔍 Fetching column information...');
    const result = await connection.execute(columnsQuery);

    if (result.rows && result.rows.length > 0) {
      // Generate CSV
      const headers = result.metaData?.map((col) => col.name) || [];
      let csv = headers.join(',') + '\n';

      for (const row of result.rows) {
        const csvRow = row
          .map((field: any) => {
            if (field === null || field === undefined) return '';
            return `"${String(field).replace(/"/g, '""')}"`;
          })
          .join(',');
        csv += csvRow + '\n';
      }

      // Write to file
      const outputPath = path.join(process.cwd(), 'oracle_table_structure.csv');
      fs.writeFileSync(outputPath, csv, 'utf8');

      console.log(`📊 Table structure exported to: ${outputPath}`);
      console.log(
        `📋 Total tables: ${new Set(result.rows.map((row: any) => row[0])).size}`,
      );
      console.log(`🔢 Total columns: ${result.rows.length}`);

      // Generate sample queries
      generateSampleQueries(tables);

      // Generate table summary
      generateTableSummary(result.rows);
    } else {
      console.log('❌ No columns found');
    }
  } catch (error) {
    console.error('❌ Error:', error);

    // More detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      if ('code' in error) {
        console.error('Oracle error code:', (error as any).code);
      }
      if ('offset' in error) {
        console.error('SQL offset:', (error as any).offset);
      }
    }

    // Show troubleshooting tips
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check if Oracle Database is running');
    console.log('2. Verify the correct SID or SERVICE_NAME');
    console.log('3. Check if the listener is running on port 1521');
    console.log('4. Try connecting with SQL*Plus to test connection');
    console.log('5. Check Oracle listener configuration (lsnrctl status)');
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔌 Connection closed');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

function generateSampleQueries(tables: string[]) {
  let queriesCSV = 'Table Name,Sample Query,Description\n';

  for (const table of tables) {
    const sampleQuery = `SELECT * FROM "${table}"`;
    const description = `Query to select all data from ${table} table`;
    queriesCSV += `"${table}","${sampleQuery}","${description}"\n`;
  }

  const queriesPath = path.join(process.cwd(), 'sample_queries.csv');
  fs.writeFileSync(queriesPath, queriesCSV, 'utf8');

  console.log(`📝 Sample queries exported to: ${queriesPath}`);
}

function generateTableSummary(rows: any[]) {
  // Group columns by table
  const tableColumns: { [key: string]: any[] } = {};

  for (const row of rows) {
    const tableName = row[0];
    if (!tableColumns[tableName]) {
      tableColumns[tableName] = [];
    }
    tableColumns[tableName].push(row);
  }

  let summaryCSV =
    'Table Name,Column Count,Primary Key Columns,Foreign Key Columns,Description\n';

  for (const [tableName, columns] of Object.entries(tableColumns)) {
    const columnCount = columns.length;
    const primaryKeys = columns.filter(
      (col) =>
        col[1].toLowerCase().includes('id') &&
        col[1].toLowerCase().includes('pk'),
    ).length;
    const foreignKeys = columns.filter(
      (col) =>
        col[1].toLowerCase().includes('id') &&
        !col[1].toLowerCase().includes('pk'),
    ).length;
    const description = `Table with ${columnCount} columns`;

    summaryCSV += `"${tableName}","${columnCount}","${primaryKeys}","${foreignKeys}","${description}"\n`;
  }

  const summaryPath = path.join(process.cwd(), 'table_summary.csv');
  fs.writeFileSync(summaryPath, summaryCSV, 'utf8');

  console.log(`📊 Table summary exported to: ${summaryPath}`);
}

// Run the script
exportTableStructure()
  .then(() => {
    console.log('🎉 Export completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  });
