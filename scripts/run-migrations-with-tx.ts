import { runMigrationsWithTransaction } from '../src/database/migration-utils';

/**
 * Run migrations with transaction support
 */
async function main() {
  try {
    console.log('Starting migrations with transaction...');
    await runMigrationsWithTransaction();
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migrations failed:', error);
    process.exit(1);
  }
}

main();
