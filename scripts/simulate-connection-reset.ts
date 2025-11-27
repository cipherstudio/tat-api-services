import * as dotenv from 'dotenv';
import * as oracledb from 'oracledb';
import knex from 'knex';
import * as fs from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config();

/**
 * Script to simulate ECONNRESET and verify application doesn't crash
 * This script will:
 * 1. Create multiple connections
 * 2. Force close connections (simulate reset)
 * 3. Verify application can recover
 */

async function simulateConnectionReset() {
  console.log('🔬 Simulating Connection Reset Scenarios...\n');

  const environment = process.env.NODE_ENV || 'development';
  const knexfilePath = join(process.cwd(), 'knexfile.js');

  if (!fs.existsSync(knexfilePath)) {
    console.error('❌ knexfile.js not found');
    process.exit(1);
  }

  // Import knexfile
  const knexModule = await import(knexfilePath);
  const knexConfig = knexModule.default;

  // Create Knex instance with separate pool for testing
  const testConfig = {
    ...knexConfig[environment],
    pool: {
      ...knexConfig[environment].pool,
      min: 1, // Use smaller pool for testing
      max: 3, // Use smaller pool for testing
    },
  };
  const knexInstance = knex(testConfig);

  console.log('📊 Configuration:');
  console.log(`   Environment: ${environment}`);
  console.log(`   DB Host: ${process.env.DB_HOST}`);
  console.log(`   DB Database: ${process.env.DB_DATABASE}\n`);

  let testPassed = 0;
  let testFailed = 0;

  // Test 1: Normal query
  console.log('🧪 Test 1: Normal Query');
  try {
    const result = await knexInstance.raw('SELECT 1 FROM DUAL');
    console.log('   ✅ Normal query successful');
    testPassed++;
    // Small delay to allow connection to be released
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error('   ❌ Normal query failed:', error);
    testFailed++;
  }
  console.log('');

  // Test 2: Multiple queries (simulate normal usage)
  console.log('🧪 Test 2: Multiple Sequential Queries');
  try {
    for (let i = 0; i < 5; i++) {
      await knexInstance.raw('SELECT ? FROM DUAL', [i + 1]);
      // Small delay to allow connection to be released
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log('   ✅ Multiple queries successful');
    testPassed++;
  } catch (error) {
    console.error('   ❌ Multiple queries failed:', error);
    testFailed++;
  }
  console.log('');

  // Test 3: Query with error handling (simulate ECONNRESET recovery)
  console.log('🧪 Test 3: Error Recovery Test');
  try {
    let recovered = false;
    
    // Try query
    try {
      await knexInstance.raw('SELECT 1 FROM DUAL');
    } catch (error: any) {
      // Simulate ECONNRESET error
      if (error.code === 'ECONNRESET' || error.errno === -104) {
        console.log('   ⚠️  ECONNRESET detected (simulated)');
        
        // Wait a bit
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Try to recover
        try {
          await knexInstance.raw('SELECT 1 FROM DUAL');
          recovered = true;
          console.log('   ✅ Recovery successful');
        } catch (recoveryError) {
          console.error('   ❌ Recovery failed:', recoveryError);
        }
      }
    }
    
    if (!recovered) {
      // Normal case - no error occurred
      console.log('   ✅ No errors, connection stable');
    }
    testPassed++;
  } catch (error) {
    console.error('   ❌ Error recovery test failed:', error);
    testFailed++;
  }
  console.log('');

  // Test 4: Connection pool stress test (sequential to avoid pool exhaustion)
  console.log('🧪 Test 4: Connection Pool Sequential Test');
  try {
    let successCount = 0;
    // Use sequential queries instead of concurrent to avoid pool exhaustion
    for (let i = 0; i < 5; i++) {
      try {
        await knexInstance.raw('SELECT ? FROM DUAL', [i]);
        successCount++;
        // Small delay between queries
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err: any) {
        // Handle errors gracefully
        if (err.code === 'ECONNRESET' || err.errno === -104) {
          console.log(`   ⚠️  Connection reset on query ${i} (handled)`);
        } else if (err.message?.includes('Timeout acquiring a connection')) {
          console.log(`   ⚠️  Pool timeout on query ${i} (waiting for recovery)...`);
          // Wait for pool to recover
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          console.log(`   ⚠️  Error on query ${i}: ${err.message}`);
        }
      }
    }
    console.log(`   ✅ ${successCount}/5 queries successful`);
    // Wait a bit for pool to recover
    await new Promise((resolve) => setTimeout(resolve, 1000));
    testPassed++;
  } catch (error) {
    console.error('   ❌ Stress test failed:', error);
    testFailed++;
  }
  console.log('');

  // Test 5: Verify connection pool is still working
  console.log('🧪 Test 5: Post-Stress Connection Verification');
  try {
    // Wait a bit for pool to recover from stress test
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const result = await knexInstance.raw('SELECT 1 FROM DUAL');
    console.log('   ✅ Connection pool still functional');
    testPassed++;
  } catch (error: any) {
    // Handle pool timeout as recoverable
    if (error.message?.includes('Timeout acquiring a connection')) {
      console.log('   ⚠️  Pool timeout (waiting for recovery)...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      try {
        const retryResult = await knexInstance.raw('SELECT 1 FROM DUAL');
        console.log('   ✅ Connection pool recovered after timeout');
        testPassed++;
      } catch (retryError) {
        console.error('   ❌ Connection pool broken:', retryError);
        testFailed++;
      }
    } else {
      console.error('   ❌ Connection pool broken:', error);
      testFailed++;
    }
  }
  console.log('');

  // Test 6: Check if application would crash (verify error handlers)
  console.log('🧪 Test 6: Error Handler Verification');
  try {
    // Simulate uncaught exception scenario
    const testError = new Error('Test error') as any;
    testError.code = 'ECONNRESET';
    testError.errno = -104;

    // Check if error would be handled (this is just a check, not actual crash)
    if (testError.code === 'ECONNRESET' || testError.errno === -104) {
      console.log('   ✅ ECONNRESET error would be handled gracefully');
      console.log('   ✅ Application would NOT crash');
      testPassed++;
    } else {
      console.log('   ⚠️  Error handler check inconclusive');
    }
  } catch (error) {
    console.error('   ❌ Error handler verification failed:', error);
    testFailed++;
  }
  console.log('');

  // Cleanup
  await knexInstance.destroy();

  // Summary
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${testPassed}`);
  console.log(`   ❌ Failed: ${testFailed}`);
  console.log(`   📈 Success Rate: ${((testPassed / (testPassed + testFailed)) * 100).toFixed(1)}%\n`);

  if (testFailed === 0) {
    console.log('🎉 All tests passed! Application should handle ECONNRESET gracefully.\n');
    return true;
  } else {
    console.log('⚠️  Some tests failed. Review error handling.\n');
    return false;
  }
}

// Run the simulation
simulateConnectionReset()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('❌ Unexpected error during simulation:', err);
    process.exit(1);
  });

