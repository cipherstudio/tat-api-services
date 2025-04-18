import knex from 'knex';
import { join } from 'path';
import * as fs from 'fs';

/**
 * Run Knex migrations programmatically
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

  try {
    console.log(`Running migrations for environment: ${environment}`);
    const [batchNo, log] = await knexInstance.migrate.latest();

    if (log.length === 0) {
      console.log('No migrations to run, already up to date');
    } else {
      console.log(`Batch ${batchNo} run: ${log.length} migrations`);
      console.log(`Completed migrations: ${log.join(', ')}`);
    }
  } catch (error) {
    console.error('Error running migrations:', error);
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
