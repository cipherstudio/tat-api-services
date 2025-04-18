const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

console.log('Oracle Setup Verification');
console.log('========================');

// Check environment variables
console.log('Environment Variables:');
console.log(`DB_HOST: ${process.env.DB_HOST || 'Not set'}`);
console.log(`DB_PORT: ${process.env.DB_PORT || 'Not set'}`);
console.log(`DB_USERNAME: ${process.env.DB_USERNAME ? 'Set' : 'Not set'}`);
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? 'Set' : 'Not set'}`);
console.log(`DB_DATABASE: ${process.env.DB_DATABASE || 'Not set'}`);
console.log(
  `ORACLE_CLIENT_PATH: ${process.env.ORACLE_CLIENT_PATH || 'Not set'}`,
);

// Check if Oracle client path exists
if (process.env.ORACLE_CLIENT_PATH) {
  const clientPathExists = fs.existsSync(process.env.ORACLE_CLIENT_PATH);
  console.log(`Oracle client path exists: ${clientPathExists}`);

  if (clientPathExists) {
    // List files in the directory
    console.log('\nOracle client directory contents:');
    const files = fs.readdirSync(process.env.ORACLE_CLIENT_PATH);
    files.forEach((file) => {
      console.log(`  - ${file}`);
    });
  }
} else {
  console.log('Oracle client path is not set in environment variables');
}

// Check knexfile.js
console.log('\nChecking knexfile.js:');
const knexfilePath = path.join(process.cwd(), 'knexfile.js');
if (fs.existsSync(knexfilePath)) {
  console.log('knexfile.js exists');
} else {
  console.log('knexfile.js does not exist');
}

console.log('\nVerification complete. Please review the above information.');
