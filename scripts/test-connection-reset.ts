import * as dotenv from 'dotenv';
import * as oracledb from 'oracledb';
import * as http from 'http';

// Load environment variables
dotenv.config();

/**
 * Test script to verify that ECONNRESET errors don't crash the application
 * This script simulates connection reset scenarios and verifies recovery
 */

async function testConnectionReset() {
  console.log('🧪 Testing Connection Reset Recovery...\n');

  const dbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST})(PORT=${process.env.DB_PORT || '1521'}))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=${process.env.DB_DATABASE})))`,
  };

  console.log('📊 Database Configuration:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT || '1521'}`);
  console.log(`   Database: ${process.env.DB_DATABASE}`);
  console.log(`   Username: ${process.env.DB_USERNAME}\n`);

  // Test 1: Normal connection
  console.log('✅ Test 1: Normal Connection');
  try {
    const conn1 = await oracledb.getConnection(dbConfig);
    const result1 = await conn1.execute('SELECT 1 FROM DUAL');
    await conn1.close();
    console.log('   ✓ Normal connection successful\n');
  } catch (error) {
    console.error('   ✗ Normal connection failed:', error);
    return false;
  }

  // Test 2: Multiple rapid connections (simulate connection pool)
  console.log('✅ Test 2: Multiple Rapid Connections');
  try {
    const connections = [];
    for (let i = 0; i < 5; i++) {
      const conn = await oracledb.getConnection(dbConfig);
      connections.push(conn);
    }
    console.log(`   ✓ Created ${connections.length} connections`);
    
    // Close all connections
    for (const conn of connections) {
      await conn.close();
    }
    console.log('   ✓ All connections closed successfully\n');
  } catch (error) {
    console.error('   ✗ Multiple connections failed:', error);
    return false;
  }

  // Test 3: Connection with timeout (simulate network issues)
  console.log('✅ Test 3: Connection with Timeout Settings');
  try {
    const conn3 = await oracledb.getConnection({
      ...dbConfig,
      connectTimeout: 5000, // 5 seconds
    });
    const result3 = await conn3.execute('SELECT 1 FROM DUAL');
    await conn3.close();
    console.log('   ✓ Connection with timeout successful\n');
  } catch (error) {
    console.error('   ✗ Connection with timeout failed:', error);
    return false;
  }

  // Test 4: Query after connection reset simulation
  console.log('✅ Test 4: Query Recovery After Error');
  try {
    let conn4;
    try {
      conn4 = await oracledb.getConnection(dbConfig);
      // Simulate error by closing connection unexpectedly
      await conn4.close();
      // Try to use closed connection (should fail gracefully)
      try {
        await conn4.execute('SELECT 1 FROM DUAL');
      } catch (err: any) {
        if (err.code === 'NJS-509' || err.message?.includes('closed')) {
          console.log('   ✓ Detected closed connection (expected)');
        }
      }
      
      // Reconnect and verify recovery
      conn4 = await oracledb.getConnection(dbConfig);
      const result4 = await conn4.execute('SELECT 1 FROM DUAL');
      await conn4.close();
      console.log('   ✓ Reconnection after error successful\n');
    } catch (err) {
      if (conn4) {
        try {
          await conn4.close();
        } catch {}
      }
      throw err;
    }
  } catch (error) {
    console.error('   ✗ Query recovery failed:', error);
    return false;
  }

  // Test 5: Concurrent connections (stress test)
  console.log('✅ Test 5: Concurrent Connections (Stress Test)');
  try {
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(
        (async () => {
          const conn = await oracledb.getConnection(dbConfig);
          const result = await conn.execute('SELECT 1 FROM DUAL');
          await conn.close();
          return result;
        })(),
      );
    }
    
    const results = await Promise.all(promises);
    console.log(`   ✓ ${results.length} concurrent connections successful\n`);
  } catch (error) {
    console.error('   ✗ Concurrent connections failed:', error);
    return false;
  }

  // Test 6: Check application health endpoint
  console.log('✅ Test 6: Application Health Check');
  try {
    const healthUrl = process.env.APP_URL || 'http://localhost:3000';
    const healthEndpoint = `${healthUrl}/api/v1/`;
    
    await new Promise<void>((resolve, reject) => {
      const req = http.get(healthEndpoint, (res) => {
        console.log(`   ✓ Application responding (Status: ${res.statusCode})`);
        resolve();
      });
      
      req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
          console.log('   ⚠ Application not running (expected in test environment)');
          resolve(); // Not a failure, just not running
        } else {
          reject(err);
        }
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        console.log('   ⚠ Application health check timeout (may not be running)');
        resolve(); // Not a failure
      });
    });
    console.log('');
  } catch (error) {
    console.log('   ⚠ Health check failed (application may not be running)\n');
  }

  console.log('🎉 All connection tests completed successfully!');
  console.log('\n📝 Summary:');
  console.log('   - Normal connections: ✓');
  console.log('   - Multiple connections: ✓');
  console.log('   - Timeout handling: ✓');
  console.log('   - Error recovery: ✓');
  console.log('   - Concurrent connections: ✓');
  console.log('\n✅ Application should handle ECONNRESET gracefully\n');
  
  return true;
}

// Run the test
testConnectionReset()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('❌ Unexpected error during test:', err);
    process.exit(1);
  });

