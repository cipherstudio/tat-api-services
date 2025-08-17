const oracledb = require('oracledb');

async function checkConstraint() {
  let connection;

  try {
    // Connect to Oracle
    connection = await oracledb.getConnection({
      user: 'tat_dev',
      password: 'Cipher@dev_123',
      connectString: '82.29.167.110:1521/XE',
    });

    console.log('Connected to Oracle database');

    // Query to get all constraints for the approval table
    const query = `
      SELECT 
        c.owner,
        c.constraint_name,
        c.constraint_type,
        c.search_condition,
        cc.column_name,
        c.table_name
      FROM all_constraints c
      LEFT JOIN all_cons_columns cc ON c.constraint_name = cc.constraint_name AND c.owner = cc.owner
      WHERE c.constraint_name = 'SYS_C008600'
      OR c.table_name = 'APPROVAL'
      ORDER BY c.owner, c.constraint_name, cc.position
    `;

    const result = await connection.execute(query);

    console.log('Constraint details:');
    console.log(JSON.stringify(result.rows, null, 2));

    // Check all tables with 'approval' in the name
    const tableQuery = `
      SELECT 
        owner,
        table_name,
        column_name,
        data_type,
        data_length,
        nullable,
        data_default
      FROM all_tab_columns 
      WHERE UPPER(table_name) LIKE '%APPROVAL%'
      ORDER BY owner, table_name, column_id
    `;

    const tableResult = await connection.execute(tableQuery);

    console.log('\nAll approval-related tables:');
    console.log(JSON.stringify(tableResult.rows, null, 2));

    // Check what schema we're connected to
    const schemaQuery = `SELECT USER FROM DUAL`;
    const schemaResult = await connection.execute(schemaQuery);
    console.log('\nCurrent user/schema:', schemaResult.rows[0][0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Connection closed');
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
}

checkConstraint();
