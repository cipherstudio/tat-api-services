import { runSeedsWithTransaction } from '../src/database/migration-utils';

/**
 * Run seeds with transaction support
 */
async function main() {
  try {
    console.log('Starting seeds with transaction...');
    await runSeedsWithTransaction();
    console.log('Seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeds failed:', error);
    process.exit(1);
  }
}

main();
