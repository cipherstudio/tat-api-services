import * as dotenv from 'dotenv';
import * as oracledb from 'oracledb';

// Load environment variables
dotenv.config();

// Create a minimal config service to read env variables
const configService = {
  get: (key: string) => process.env[key],
};

async function testOracleConnection() {
  let connection;

  try {
    console.log('Testing Oracle connection...');
    console.log('Host:', configService.get('DB_HOST'));
    console.log('Port:', configService.get('DB_PORT'));
    console.log('Username:', configService.get('DB_USERNAME'));
    console.log('Database:', configService.get('DB_DATABASE'));

    // Oracle connection string format
    const connectString = `${configService.get('DB_HOST')}:${configService.get('DB_PORT')}/${configService.get('DB_DATABASE')}`;
    console.log('Connection string:', connectString);

    // Attempt to establish connection
    connection = await oracledb.getConnection({
      user: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      connectString,
    });

    console.log('Connection to Oracle database established successfully!');

    // Test query to check connection is working
    const result = await connection.execute('SELECT 1 FROM DUAL');
    console.log('Query result:', result.rows);

    console.log('Oracle connection test completed successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to Oracle database:');
    console.error(error);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Connection closed');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// Run the test function
testOracleConnection()
  .then((success) => {
    console.log('Test completed with status:', success ? 'SUCCESS' : 'FAILURE');
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Unexpected error during test:', err);
    process.exit(1);
  });
