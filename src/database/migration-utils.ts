import knex from 'knex';
import { join } from 'path';
import * as fs from 'fs';

/**
 * Initialize Knex instance
 */
export async function initializeKnex() {
  const environment = process.env.NODE_ENV || 'development';
  const knexfilePath = join(process.cwd(), 'knexfile.js');

  if (!fs.existsSync(knexfilePath)) {
    throw new Error(`Knexfile not found at ${knexfilePath}`);
  }

  // Import knexfile as ES module
  const knexModule = await import(knexfilePath);
  const knexConfig = knexModule.default;
  return knex(knexConfig[environment]);
}

/**
 * Run migrations with transaction support
 */
export async function runMigrationsWithTransaction(): Promise<void> {
  const knexInstance = await initializeKnex();
  const trx = await knexInstance.transaction();

  try {
    console.log('Starting migration transaction...');
    const [batchNo, log] = await trx.migrate.latest();

    if (log.length === 0) {
      console.log('No migrations to run, already up to date');
    } else {
      console.log(`Batch ${batchNo} run: ${log.length} migrations`);
      console.log(`Completed migrations: ${log.join(', ')}`);
    }

    await trx.commit();
    console.log('Migration transaction committed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    console.log('Rolling back migration transaction...');
    await trx.rollback();
    console.log('Migration transaction rolled back');
    throw error;
  } finally {
    await knexInstance.destroy();
  }
}

/**
 * Run seeds with transaction support
 */
export async function runSeedsWithTransaction(): Promise<void> {
  const knexInstance = await initializeKnex();
  const trx = await knexInstance.transaction();

  try {
    console.log('Starting seed transaction...');
    const log = await trx.seed.run();

    console.log(`Completed seeds: ${log.length} seed(s) processed`);

    await trx.commit();
    console.log('Seed transaction committed successfully');
  } catch (error) {
    console.error('Seed error:', error);
    console.log('Rolling back seed transaction...');
    await trx.rollback();
    console.log('Seed transaction rolled back');
    throw error;
  } finally {
    await knexInstance.destroy();
  }
}

/**
 * Run both migrations and seeds with transaction support
 */
export async function runMigrationsAndSeedsWithTransaction(): Promise<void> {
  try {
    // Run migrations first
    await runMigrationsWithTransaction();

    // Then run seeds
    await runSeedsWithTransaction();

    console.log('All database operations completed successfully');
  } catch (error) {
    console.error('Database operations failed:', error);
    throw error;
  }
}
