import { runMigrationsAndSeedsWithTransaction } from '../src/database/migration-utils';

/**
 * Run migrations and seeds with transaction support
 */
async function main() {
  try {
    console.log('Starting migrations and seeds with transaction...');
    await runMigrationsAndSeedsWithTransaction();
    console.log('Migrations and seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migrations and seeds failed:', error);
    process.exit(1);
  }
}

main();
