import knex from 'knex';
import { join } from 'path';
import * as fs from 'fs';

/**
 * Run Knex migrations programmatically with transaction support
 */
export async function runMigrations(): Promise<void> {
  const environment = process.env.NODE_ENV || 'development';

  // Find knexfile.js from the current working directory
  const knexfilePath = join(process.cwd(), 'knexfile.js');

  if (!fs.existsSync(knexfilePath)) {
    throw new Error(`Knexfile not found at ${knexfilePath}`);
  }

  // Import knexfile as ES module
  const knexModule = await import(knexfilePath);
  const knexConfig = knexModule.default;
  const knexInstance = knex(knexConfig[environment]);

  // Start transaction
  const trx = await knexInstance.transaction();

  try {
    console.log(`Running migrations for environment: ${environment}`);
    console.log('Starting migration transaction...');

    const [batchNo, log] = await trx.migrate.latest();

    if (log.length === 0) {
      console.log('No migrations to run, already up to date');
    } else {
      console.log(`Batch ${batchNo} run: ${log.length} migrations`);
      console.log(`Completed migrations: ${log.join(', ')}`);
    }

    // Commit transaction
    await trx.commit();
    console.log('Migration transaction committed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    console.log('Rolling back migration transaction...');

    // Rollback transaction
    await trx.rollback();
    console.log('Migration transaction rolled back');

    throw error;
  } finally {
    await knexInstance.destroy();
  }
}

// Execute if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
